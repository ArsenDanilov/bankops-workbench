# W2 — Workspace Structural Layout + First-Fold Evidence — Implementation Report

## Status

NEEDS_REVIEW

## Goal

Replace the intentionally minimal W1 Review Case Workspace success surface with
the accepted desktop investigation composition while preserving the W1 route,
detailed query, async states, and Review Queue behavior.

## Implemented

- Added the compact case orientation with separate lifecycle, ownership, SLA,
  transfer reminder, and Operation status semantics.
- Added one solid Investigation Canvas with Operation, Risk Assessment, Customer
  Behavior, Recipient Relationship, conditional Device Context, and the
  Transaction History investigation boundary.
- Rendered all three immutable canonical risk-snapshot signals and the
  authoritative W1 evidence values.
- Added the content-defined, sticky 360px Decision Rail as structural decision
  context without Release, Block, form, or mutation controls.
- Preserved loading, success, not-found, generic error with Retry, and case
  navigation behavior from W1.
- Extended the detailed projection only with server-authored SLA and recent
  outgoing-transfer values required by the approved W2 presentation.

## Files changed

- `src/pages/ReviewCaseWorkspacePage/ReviewCaseWorkspacePage.tsx`
- `src/pages/ReviewCaseWorkspacePage/ReviewCaseWorkspacePage.module.css`
- `src/pages/ReviewCaseWorkspacePage/components/CaseOrientation.tsx`
- `src/pages/ReviewCaseWorkspacePage/components/InvestigationCanvas.tsx`
- `src/pages/ReviewCaseWorkspacePage/components/DecisionRail.tsx`
- `src/pages/ReviewCaseWorkspacePage/lib/workspaceFormatters.ts`
- `src/pages/ReviewCaseWorkspacePage/model/reviewCase.types.ts`
- `src/pages/ReviewCaseWorkspacePage/api/reviewCaseDetailsApi.ts`
- `src/mocks/data/reviewCaseDetails.fixtures.ts`
- `src/pages/ReviewCaseWorkspacePage/ReviewCaseWorkspacePage.test.tsx`
- `src/pages/ReviewCaseWorkspacePage/ReviewCaseWorkspaceLayout.test.tsx`
- `src/pages/ReviewCaseWorkspacePage/api/reviewCaseDetailsApi.test.ts`
- `docs/visual/review-case-workspace.md`
- `docs/architecture/architecture-decisions.md`
- `docs/tasks/current.md`
- `docs/tasks/backlog.md`
- `docs/reports/W2-workspace-first-fold.md`

## Dependencies added

None.

## Visual specification synchronization

Created `docs/visual/review-case-workspace.md` to record the accepted Operational
Glass language, exact 1440px desktop geometry, semantic hierarchy, solid data
canvas, content-defined glass Decision Rail, conditional evidence behavior, and
the explicit W3+ boundaries. The current Segoe UI/system font implementation is
preserved; Inter remains deferred visual-calibration work.

## Component structure

The success surface now composes Workspace-local `CaseOrientation`,
`InvestigationCanvas`, and `DecisionRail` components. The canvas owns semantic
evidence sections and dividers rather than floating Card abstractions. No generic
panel framework or speculative cross-application components were introduced.

## Exact browser geometry

Measured at 1440 × 900 on `/review-cases/RC-260907-0314`:

- useful Workspace grid: 1392px, x=24 to x=1416;
- Workspace top: y=192;
- Investigation Canvas: 1008 × 658px;
- canvas/rail gap: 24px;
- Decision Rail: 360 × 388px;
- Case Orientation: 1392 × 72px, y=104;
- first evidence row: 1008 × 248px;
- Operation / divider / Risk: 392 / 1 / 615px;
- second evidence row: 1008 × 216px;
- Behavior / divider / Recipient: 604 / 1 / 403px;
- horizontal canvas dividers: 1px each;
- Device Context strip: 1008 × 72px;
- Transaction History boundary: y=730, 1008 × 120px;
- document width: clientWidth 1440px, scrollWidth 1440px;
- document height: clientHeight 900px, scrollHeight 900px.

## First-fold rendering

The canonical first viewport shows the accepted investigation sequence without
compressing the evidence: orientation, Operation and complete Risk Assessment,
Behavior and Recipient context, the conditional Device comparison, and the
visible beginning of Transaction History. Score 78 remains neutral metadata and
does not compete with the evidence hierarchy. The canonical recipient name uses
the permitted two lines while its masked account remains visible.

## Decision Rail

The rail is a near-opaque Operational Glass foreground surface with a solid
fallback. It contains only the case reminder, amount and recipient, three signal
titles, amount deviation, recipient relationship, and authoritative readiness
status. It has no fake or disabled decision controls. At a 1440 × 600 scroll
probe, after scrolling 260px, the rail top measured exactly 72px and remained
bounded by the Workspace container.

## Conditional Device handling

Device Context renders because `device_change` is present and the W1 projection
marks Device context as required and available. Location is absent and no empty
placeholder is rendered. A focused test also verifies that the entire Device
strip disappears when Device context is not relevant.

## Tests

Final result: 11 test files and 65 tests passed. Focused W2 coverage protects the
canonical structure, three immutable snapshot signals, separate lifecycle and
Operation status, neutral score wording, new-recipient domain context, absence of
decision controls and Location, and conditional Device removal. Existing W1
async/navigation and Review Queue tests remain green.

## Browser review

- route: `/review-cases/RC-260907-0314`;
- viewport: 1440 × 900;
- shell: unchanged 56px application shell;
- geometry: all accepted values measured exactly as listed above;
- sticky behavior: rail respected the 72px top offset during a reduced-height
  scroll probe and did not overlap the shell;
- wrapping/overflow: canonical recipient fits in two lines, section heights did
  not expand, and no horizontal overflow appeared;
- hierarchy/materials: canvas remained solid, glass was limited to the rail,
  score and rail did not dominate evidence;
- keyboard: first Tab stop was the Review Queue link with a visible blue focus
  outline;
- states: the canonical success route and an unknown case 404 were checked in
  browser; loading and generic error/Retry remain covered by integration tests;
- console: no unexpected warnings or errors on Workspace or Review Queue;
- Queue regression: `/review-queue` rendered its existing table with nine visible
  data rows at the review position and document scrollWidth equaled 1440px.

## Quality gate

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run test`: PASS — 11 files, 65 tests.
- `npm run build`: PASS — 104 modules transformed; production bundle generated.
- `git diff --check`: PASS (Git reported only the repository's Windows LF-to-CRLF
  working-copy notices).

## Accessibility review

The page retains one application `main`, one page `h1`, ordered section `h2`s,
native back navigation, semantic definition lists, and a complementary `aside`.
Lifecycle, ownership, SLA, operation status, risk evidence, and readiness all have
text alternatives independent of color. Existing visible focus and reduced-
motion/reduced-transparency support are preserved.

## Product changes

None.

## Architecture deviations

None.

## Visual deviations

None.

## Known issues

- Transaction History data and rows remain intentionally absent until W4.
- Risk-to-evidence navigation, capped amount visualization, and final progressive
  disclosure remain intentionally deferred to W3.
- Decision workflow and mutations remain intentionally deferred to W6/W7.
- The accepted Inter target remains deferred; the current Segoe UI/system stack
  is unchanged.
- Browser review exercised success, 404, geometry, sticky behavior, focus, and
  Queue regression. Deterministic loading and generic error/Retry states were
  verified by integration tests rather than an interactive browser control.

## Recommended next step

After human acceptance, proceed with **W3 — Evidence Grammar + Risk Navigation**.
Do not begin W3 from this task.
