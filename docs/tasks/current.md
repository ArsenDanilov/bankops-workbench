# Current implementation milestone

Current milestone:
M9 — Quality Gate

Status:
NEEDS_REVIEW

M-AUTO1 is human-accepted; its acceptance remains recorded in
[the M-AUTO1 report](../reports/M-AUTO1-agent-workflow-foundation.md).

## Approved assignment

Create an automated safety net around Review Queue Visual Prototype v1 before
M10 replaces its data source. The dedicated M9 task approves Vitest, jsdom,
React Testing Library, user-event and jest-dom as development dependencies.

This file contains only the currently approved implementation milestone. Backlog
entries are not concurrent assignments. Replace this task only when the next
milestone is approved; preserve completed facts in milestone reports.

## Goal and scope

Configure deterministic non-watch `npm run test`, keep global setup generic,
cover URL state, filtering/search, Risk disclosure, incoming cases, current
pagination and useful accessibility contracts. Add a minimal GitHub Actions gate
using Node 24 and `npm ci`, lint, typecheck, test and build. Preserve existing
lint/typecheck/build semantics and approved Product/UX/visual behavior.

## Acceptance and verification

- Verify infrastructure, pure logic and interactions in phases; fix in-scope
  failures before proceeding. Avoid coverage-percentage targets or brittle tests.
- Final gate: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
- Review Git diff and validate the CI workflow where possible.
- Browser regression review is required only if production application code changes.
- The [M9 report](../reports/M9-quality-gate.md) records test architecture,
  coverage, CI, production testability changes and final verification results.
- On completion set `NEEDS_REVIEW`, never `ACCEPTED` without human acceptance.

## Out of scope

No intentional changes to Queue UI, geometry, fonts, routing, filters, URL
contract, domain semantics or fixtures. Only small behavior-preserving production
refactors for clear testability needs are allowed. No M10, TanStack Query, MSW,
API client, backend, server pagination, polling, real-time data, global state
store, TanStack Table, Playwright, Cypress, Storybook, visual regression,
deployment, Workspace or Case History implementation.

## Recommended follow-up after human acceptance

M-AUTO2 — Codex SDK Orchestrator, subject to its own separately approved milestone.
Do not start it automatically; no orchestrator or SDK belongs to M9.

## Allowed statuses

- `READY`: approved and ready to begin.
- `IN_PROGRESS`: implementation is underway.
- `NEEDS_REVIEW`: implementation/report ready for human review; not accepted.
- `BLOCKED`: cannot continue within approved scope; record the missing decision.
- `ACCEPTED`: explicitly accepted by the human reviewer only.
