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

## Deferred after W2

- W3: amount comparison visualization, Risk → Evidence navigation and final
  progressive disclosure for 4–5 signals.
- W4: Transaction History request and rows.
- Later milestones: missing-context treatment, queued/other-analyst/terminal
  states, Claim, Release/Block form, mutation/concurrency handling, Case History.
- Responsive/mobile Workspace behavior and Inter reconciliation.

None of these deferred capabilities is implemented by W2.
