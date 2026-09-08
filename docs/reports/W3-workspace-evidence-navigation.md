# W3 — Workspace Evidence Grammar + Risk Navigation — Implementation Report

## Status

NEEDS_REVIEW

## Goal

Turn the accepted W2 first fold into a coherent investigation instrument with a
compact amount comparison, contextual Risk → Evidence navigation and accessible
4–5 signal disclosure, without changing geometry or domain evidence semantics.

## Implemented

- Added the Workspace-specific amount-vs-baseline comparison to Customer
  Behavior while keeping all authoritative values textual.
- Added explicit context links for all three canonical risk signals.
- Centralized risk code → evidence destination and wording in frontend-only
  Workspace mapping.
- Added focus transfer, conditional scrolling, 72px anchor offset, restrained
  acknowledgment and reduced-motion handling.
- Added fixed-height progressive disclosure for fourth and fifth risk signals.
- Preserved immutable risk snapshots, W1 async states, W2 Decision Rail,
  Transaction History boundary and Review Queue behavior.

## Files changed

- `src/pages/ReviewCaseWorkspacePage/components/AmountBaselineComparison.tsx`
- `src/pages/ReviewCaseWorkspacePage/components/RiskAssessmentSection.tsx`
- `src/pages/ReviewCaseWorkspacePage/components/InvestigationCanvas.tsx`
- `src/pages/ReviewCaseWorkspacePage/lib/amountBaselinePresentation.ts`
- `src/pages/ReviewCaseWorkspacePage/lib/evidenceNavigation.ts`
- `src/pages/ReviewCaseWorkspacePage/ReviewCaseWorkspacePage.module.css`
- `src/pages/ReviewCaseWorkspacePage/components/AmountBaselineComparison.test.tsx`
- `src/pages/ReviewCaseWorkspacePage/ReviewCaseWorkspaceEvidenceNavigation.test.tsx`
- `docs/visual/review-case-workspace.md`
- `docs/architecture/architecture-decisions.md`
- `docs/product/product-spec.md`
- `docs/reports/W1-workspace-data-foundation.md`
- `docs/reports/W2-workspace-first-fold.md`
- `docs/tasks/current.md`
- `docs/tasks/backlog.md`
- `docs/reports/W3-workspace-evidence-navigation.md`

## Dependencies added

None.

## AmountBaselineComparison

The pure presentation helper uses zero through `1.5 × typical upper` as the
limited visual lane. Median, typical lower/upper and current positions are linear
within that presentation range and clamped to the lane. Canonical 286,000 RUB is
above the 129,000 RUB cap, so its marker sits at the edge with explicit
`Off scale` text; no numeric axis implies that the edge equals the current value.

The lane is neutral data presentation. Current, 90-day median, typical range and
deviation remain visible authoritative text, and decorative lane primitives are
hidden from assistive technology. No backend median, range, deviation or fraud
classification is recalculated.

## Risk → Evidence mapping

`lib/evidenceNavigation.ts` owns the single Workspace-local mapping:

- `unusual_amount` → `behavior-amount`;
- `new_recipient` → `recipient-relationship`;
- `high_velocity` → `behavior-activity`;
- `device_change` → `device-context`;
- `unusual_location` → `location-context`.

Links render only when the destination is actually present. The canonical three
destinations all exist; Location remains absent and no placeholder was added.
The `RiskSignal` domain/API shape is unchanged and contains no UI destination ID.

## Navigation / focus

Each action is a native link with a stable fragment. Activation prevents
unnecessary scrolling for an already-visible destination, programmatically
focuses its `tabIndex=-1` heading/wrapper, and calls native `scrollIntoView` only
when required. CSS `scroll-margin-top: 72px` accounts for the 56px shell and
breathing room without repeated coordinate calculations.

The focused destination receives a restrained violet acknowledgment for 900ms.
With `prefers-reduced-motion: reduce`, scrolling is immediate and the
acknowledgment remains static during the same brief interval.

## Progressive signal disclosure

One to three signals render fully. Four or five signals keep the 248px Risk row:
only the first three remain inline and a `+N more signals` button opens the
remaining immutable evidence in a non-modal overlay. The button has
`aria-expanded` and `aria-controls`; content is reachable by Tab, Escape closes
and restores trigger focus, and outside pointer interaction closes without a
focus trap.

## Tests

Final result: 13 test files and 74 tests passed.

New tests cover inside-range, moderate-extension and extreme/off-scale
presentation math; authoritative textual values; all canonical link destinations
and focus transfer; reduced-motion scrolling; frontend/domain separation;
immutable snapshot preservation; and five-signal disclosure rendering, keyboard
reachability, Escape closure and focus restoration. All W1/W2 and Review Queue
tests remain green.

## Browser review

- route: `/review-cases/RC-260907-0314`;
- viewport: 1440 × 900;
- Workspace grid: 1392px at x=24, y=192;
- Investigation Canvas: 1008 × 658px;
- canvas/rail gap: 24px;
- Decision Rail: 360 × 388px;
- first evidence row: 1008 × 248px;
- Operation: 392px; Risk remainder: 615px plus 1px divider;
- context row: 1008 × 216px;
- Behavior: 604px; Recipient: 403px plus 1px divider;
- Device strip: 1008 × 72px;
- Transaction History: y=730;
- amount comparison: 556 × 100px inside the unchanged Behavior section;
- overflow: document clientWidth and scrollWidth both 1440px; Risk and Behavior
  scroll heights equal their fixed heights;
- wrapping: all canonical risk evidence and explicit links remain single-line;
- navigation: all three links focused the intended destination without scrolling
  at 1440 × 900; a reduced-height keyboard probe placed `behavior-amount` at
  exactly y=72 after scrolling;
- acknowledgment: visually reviewed as a brief, restrained violet target wash;
- console: no warnings or errors;
- Queue regression: `/review-queue` retained nine visible data rows at the review
  position and no horizontal overflow;
- five-signal disclosure: integration-test reviewed because the canonical route
  intentionally remains a three-signal case.

## Quality gate

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run test`: PASS — 13 files, 74 tests.
- `npm run build`: PASS — 108 modules transformed; production bundle generated.
- `git diff --check`: PASS after final documentation update.

## Accessibility review

All context actions are native links with explicit wording. Programmatic targets
do not enter normal Tab order but retain visible focus and semantic labels.
The amount lane is supplemental to text. Disclosure uses a native button and
non-modal keyboard flow. Color is not the only carrier of Off-scale, destination,
risk evidence or readiness meaning.

## Product changes

None.

## Architecture deviations

None.

## Visual deviations

None.

## Known issues

- The canonical case intentionally does not demonstrate the 5-signal overlay or
  Location destination; focused integration fixtures cover overflow behavior.
- Location navigation remains mapped but is omitted until a real Location section
  is rendered by an approved scenario.
- Transaction History data and Decision workflow remain deferred.
- The accepted Inter target remains deferred; the Segoe UI/system stack is
  unchanged.
- The interactive browser used its default motion preference. Reduced-motion
  scrolling and static acknowledgment are covered by focused test and CSS review.
- Code Review Graph was unavailable in this environment; Git diff, symbol/caller
  search and focused tests were used for the C2 impact audit.

## Recommended next step

After human acceptance, proceed with **W4 — Transaction History Boundary**.
Do not begin W4 from this task.
