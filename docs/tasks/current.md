# Current milestone

Milestone: W4 — Review Case Workspace Transaction History Boundary

Status: NEEDS_REVIEW

## Goal

Implement the accepted 90-day Transaction History boundary, visualization,
current comparison, semantic table, pagination and local states without changing
the accepted first fold or beginning Claim/Decision workflow.

## Source of truth

- Product: `docs/product/product-spec.md`
- Visual: `docs/visual/review-case-workspace-transaction-history.md`
- Architecture: `docs/architecture/architecture-decisions.md`

## Fixed invariants / Human Gate

The human supplied the exact approved 46 events. Current 286,000 RUB is excluded;
Behavior/History share the snapshot. Human review must reconcile Behavior
`7 / 7d` with four events in the exact approved seven-day History window.

## Verification

Code freeze complete. Final gate PASS: lint, typecheck, 16 files / 92 tests,
build and diff check. Browser/accessibility review complete at 1440×900.

## Report

`docs/reports/W4-workspace-transaction-history.md`

## Next milestone boundary

After W4 human review, recommend **W5 — Claim Workflow**. Do not begin it now.
