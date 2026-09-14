# Review Case Workspace — Visual Specification v1

This file synchronizes the accepted W2 desktop composition. It extends
[Operational Glass](visual-system.md) and does not define a second visual system.
W2 implements the canonical first fold only; the deferred boundaries below are
not authorization to start later milestones.

## Reference frame

- Primary acceptance viewport: **1440 × 900**; no horizontal overflow.
- Existing Global Shell: 56px.
- Page horizontal padding: 24px, leaving a 1392px useful width.
- Page top spacing: 16px; Back row: 24px; Back-to-orientation gap: 8px;
  orientation: 72px; orientation-to-workspace gap: 16px.
- The Workspace grid begins at approximately y=192px.

The 1392px Workspace grid is:

| Region               | Width  |
| -------------------- | ------ |
| Investigation Canvas | 1008px |
| Gap                  | 24px   |
| Decision Rail        | 360px  |

At wider viewports the canvas may grow. The Decision Rail remains 360px.
Responsive/mobile Workspace behavior is not part of W2.

## Orientation

The Back row is a single `← Review Queue` link, not a breadcrumb chain. The
compact two-line orientation keeps the accepted hierarchy:

- row 1: Case ID, `In review`, ownership marker/`You`, `11 min left`, `Due 13:42`;
- row 2: `Outgoing transfer · 286 000 ₽` and the separate `Operation held` state.

Case lifecycle, ownership, SLA urgency and Operation status remain distinct.
Customer, recipient, accounts and risk evidence are not repeated in orientation.
The header is not a hero banner.

## Investigation Canvas

The canvas is one coherent solid/near-solid data plane. Semantic sections,
one-pixel dividers, spacing and typography establish hierarchy; individual
evidence contexts are not floating cards and do not use backdrop blur.

### Primary evidence row

- Height: 248px.
- Split: Operation 392px / divider 1px / Risk Assessment 615px.
- Section padding: 24px horizontal / 16px vertical.

Operation renders the authoritative W1 OperationContext: 22/28 semibold amount,
initiation time, compact Source → Recipient comparison, masked accounts and
subordinate payment purpose. The neutral arrow is static. Names may use two lines;
accounts remain visible. No avatars, receipt metaphors or transfer animation.

Risk Assessment renders neutral score/assessment metadata and all three canonical
signals. Each signal uses a 2px violet evidence marker, 13/18 semibold title and
12/16 evidence copy from the immutable snapshot. Score is not a gauge,
probability, colored severity badge or violet surface.

### Context evidence row

- Height: 216px.
- Split: Customer Behavior 604px / divider 1px / Recipient Relationship 403px.
- Section padding: 24px horizontal / 16px vertical.

Behavior uses a structured definition layout, not KPI cards. It exposes current
amount, 90-day median, typical range, deviation, recent 24h/7d outgoing activity
and usual weekly frequency. Values are server-authored. W2 includes no chart or
fake visualization placeholder.

Recipient Relationship renders `New recipient`, zero previous transfers,
first-seen context and lack of historical amount baseline. This is neutral domain
context, not a red warning, relationship score or fraud recommendation.

### Conditional evidence

The canonical `device_change` case renders a 72px Device Context strip comparing
the strongest current Windows 11/Chrome fact with the known iPhone 15 pattern.
Location is not relevant and no empty Location placeholder renders. When no
conditional context is relevant, the strip and its divider disappear.

### Transaction History boundary

The Transaction History region begins at approximately y=730px in the canonical
composition. W2 renders only its structural heading and availability cue. It does
not request or invent History rows.

## Decision Rail

- Width: 360px; padding: 16px; effective content: 328px.
- Initial top aligns with the canvas at approximately y=192px.
- Sticky offset: 72px; containing Workspace determines the final sticky boundary.
- Content-defined height with at least 24px page-bottom clearance.

The rail is the page's restrained Operational Glass functional foreground. Its
opaque fallback is fully legible; supported blur is progressive enhancement. It
is not a permanent full-height sidebar or glass stripe.

W2 rail content is structural only: Decision heading, Case ID, amount/recipient,
three concise signal titles, amount deviation, recipient status and the
server-authored `Ready for decision` status. It does not duplicate full risk
paragraphs and includes no Release/Block choices, form fields, confirmation or
deceptive disabled controls.

## Color, type and material

- Interaction: muted deep blue.
- Fraud evidence: violet/indigo markers.
- SLA urgency: amber/red with explicit text.
- Risk score: neutral graphite/gray.
- Canvas/data: solid or near-solid; borders precede shadow.
- Decision Rail: near-opaque glass with restrained border/elevation.

The current `Segoe UI Variable` / `Segoe UI` / system stack remains implemented.
Inter remains deferred visual-calibration debt. W2 adds no font asset or package.
Spacing uses the established 4/8/12/16/24/32 scale. Existing 2px focus treatment,
opaque fallbacks and reduced-motion behavior remain in force.

## Semantics

AppShell owns the single `<main>`. Workspace success has one page `<h1>`.
Operation, Risk Assessment, Customer Behavior, Recipient Relationship, Device
Context, Transaction History and Decision use ordered headings. The Decision Rail
is a complementary `<aside>`. DOM reading order follows the visual grid, and
sections do not become unnecessary ARIA landmarks.

## W3 evidence grammar and navigation

Customer Behavior adds a Workspace-specific textual-values-plus-lane comparison.
The lane positions amounts linearly against a presentation maximum of 1.5 times
the authoritative typical upper bound. The typical range and median remain
neutral reference marks. Amounts beyond that capped extension sit at the visual
edge with explicit `Off scale` text; the edge is not a numeric claim. Current,
median, typical range and deviation remain the primary accessible text.

Risk signals retain their immutable server snapshot and add explicit Workspace
links through one frontend-only risk-code mapping. Canonical destinations are
`behavior-amount`, `recipient-relationship` and `device-context`; activity and
future Location mappings are also centralized, but a link renders only when its
destination exists. Activation focuses the target, scrolls only when needed,
uses a 72px CSS scroll margin, and applies a restrained 900ms violet
acknowledgment. Reduced-motion preference selects immediate scrolling and a
static acknowledgment during that interval.

Risk Assessment renders one to three signals fully. Four or five signals keep
the 248px region fixed: the first three remain inline and `+N more signals`
opens a non-modal disclosure for the remainder. The native button exposes
`aria-expanded`/`aria-controls`; Escape closes and restores trigger focus,
outside pointer interaction closes, and disclosure content remains keyboard
reachable without a focus trap.

## W4 Transaction History

The approved [Transaction History specification](review-case-workspace-transaction-history.md)
records the coordinated History anatomy, interaction/state requirements and all
46 authoritative historical events. It supersedes the W2 structural-only History
boundary for W4 without changing the accepted first fold.

The W4 implementation keeps the native page scrollbar and counts its width
inside the right 24px viewport gutter, preserving 1008/24/360 geometry on
Windows. The History caption supplies a compact 24px label above its 40px header;
chart/current/row sizes remain 248/56/48px. Behavior's continuation link shares
the existing heading row, without growing its 216px section.

## W5 Claim workflow

The Decision Rail keeps its accepted 360px geometry and evidence summary. A
queued, unassigned case is explicitly labelled `Available for review` and offers
one primary native button, `Take into review`; opening the route alone changes no
ownership. Pending copy replaces the button label, prevents duplicate activation
and leaves the queued/available orientation and investigation evidence visible.

Authoritative success updates the orientation and rail to `In review` / `You`,
removes Claim and moves focus to the updated workflow context. Another-analyst
and invalidated conflict results replace stale state, keep evidence readable,
remove Claim and expose explicit read-only/conflict copy without relying on
color. Release and Block controls remain absent.

## Deferred after W5

- Later milestones: missing-context treatment, Release/Block form, Decision
  mutation, remaining concurrency handling and Case History.
- Responsive/mobile Workspace behavior and Inter reconciliation.

None of these deferred capabilities is implemented by W5.
