# Current implementation milestone

Current milestone:
M-AUTO1 — BankOps Agent Workflow Foundation

Status:
ACCEPTED

Human review is complete. M-AUTO1 was explicitly accepted by the human reviewer.

## Next approved milestone

**M9 — Quality Gate** is approved as the next milestone and is awaiting its
dedicated implementation task. Its implementation scope and acceptance criteria
are not yet supplied; do not start implementation, add tests or CI, or install
dependencies. M9 is not `READY` or `IN_PROGRESS` yet.

Keep M-AUTO1 recorded here as `ACCEPTED` until the dedicated M9 task is provided;
then replace the active task and retain M-AUTO1 acceptance in its report.

This file contains only the currently approved implementation milestone. Backlog
entries are not concurrent assignments. Replace this task only when the next
milestone is approved; preserve completed facts in milestone reports.

## Goal and scope

Create the repository development contract, concise Product/Visual/Architecture
baselines, task/backlog files and standardized reporting. No custom orchestrator.

## Acceptance and verification

- Create root `AGENTS.md` and populated `docs/product`, `docs/visual`,
  `docs/architecture`, `docs/tasks`, `docs/reports` directories.
- Document approved decisions and actual implementation separately; report
  missing details or discrepancies instead of inventing requirements.
- Run existing lint, typecheck and build commands; run tests only if present.
- Inspect Git diff, including new files; no application behavior changes.
- The [M-AUTO1 report](../reports/M-AUTO1-agent-workflow-foundation.md) records
  completed verification and human acceptance. The task transitioned from
  `IN_PROGRESS` to `NEEDS_REVIEW`, then to `ACCEPTED` on the human decision.

## Out of scope

No changes to React source, routes, Queue UI/URL state, fixtures, CSS tokens,
dependencies or package scripts. No tests, CI, automation scripts, Codex SDK,
TanStack Query, MSW, backend work, M9 or M10 implementation.

## Allowed statuses

- `READY`: approved and ready to begin.
- `IN_PROGRESS`: implementation is underway.
- `NEEDS_REVIEW`: implementation/report ready for human review; not accepted.
- `BLOCKED`: cannot continue within approved scope; record the missing decision.
- `ACCEPTED`: explicitly accepted by the human reviewer only.
