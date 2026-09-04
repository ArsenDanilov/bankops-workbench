# BankOps — Operational Glass v1

## Direction

Light enterprise UI with medium-high density. The balance is **85% calm enterprise
utility / 15% distinctive identity**; clarity and scanability take priority over
decoration.

- **Glass = functional foreground:** restrained translucent materials on the
  shell and sticky controls establish layering and context.
- **Data = solid / near-solid:** tables, evidence and decision content must remain
  readable independently of whatever scrolls underneath.
- Use restrained elevation, subtle borders and compact spacing. Avoid decorative
  glass across the whole interface.
- Glass is progressive enhancement. Use opaque defaults, enhance only when blur
  is supported, and provide reduced-transparency fallbacks.

## Semantic color

- Operational urgency ≠ fraud evidence.
- SLA due-soon uses amber; breached SLA uses red, with explicit text.
- Fraud evidence uses violet/indigo semantics, not the SLA warning palette.
- Risk score is neutral; it must not become a traffic-light severity badge.
- Muted blue supports interaction, selection and ownership emphasis.
- Do not make state understandable only through color.

## Typography and tokens

The approved visual direction names **Inter v1**. The current prototype instead
uses a `Segoe UI Variable` / `Segoe UI` / system fallback stack in
`src/app/styles/tokens.css`; it does not load Inter. This is a documented
specification/implementation discrepancy, not a new font decision. M-AUTO1 does
not change the font or geometry. Reconciliation is deferred visual-calibration
work and requires a separately approved visual task.

Use compact hierarchy, readable metadata and tabular numerals for operational
numbers. Keep semantic color, typography, spacing, radius, elevation, material
and focus tokens in CSS custom properties. Components consume tokens through CSS
Modules; do not duplicate visual tokens in TypeScript.

## Interaction and accessibility

Use semantic HTML, native actions and explicit accessible names. Preserve keyboard
navigation, visible focus, reduced-motion behavior and readable opaque materials.
Hover, focus and active states should communicate interaction without overwhelming
the data. The current focus token is a 2px blue ring with a 2px offset.

See [Review Queue v1](review-queue.md) for the accepted prototype's concrete rules.
