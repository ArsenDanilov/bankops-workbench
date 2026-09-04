# Current implementation milestone

Current milestone:
M-AUTO2 — Codex SDK Milestone Orchestrator

Status:
NEEDS_REVIEW

Report:
docs/reports/M-AUTO2-codex-sdk-orchestrator.md

M9 is human-accepted; see [its report](../reports/M9-quality-gate.md).

## Approved scope

Create a small local Node 24 TypeScript runner using the official
`@openai/codex-sdk`. Read repository rules and this task; require explicit `READY`
before execution. Start one thread, independently verify available quality scripts,
repair in the same thread at most three times, and validate report/task identity.
Provide a read-only dry run, gitignored redacted logs and focused fake-SDK tests.
End at `NEEDS_REVIEW` or `BLOCKED`, never self-accept.

## Source of truth

- [Development contract](../../AGENTS.md)
- [Product baseline](../product/product-spec.md)
- [Visual system](../visual/visual-system.md)
- [Review Queue](../visual/review-queue.md)
- [Architecture](../architecture/architecture-decisions.md)
- [Report contract](../reports/README.md)

## Verification

Run lint, typecheck, test, build and a non-executing `agent:run -- --dry-run`.
Use fake Codex boundaries in tests. A real service smoke test is optional and
must not alter application/task state. Record prerequisites and limitations.

## Out of scope

No application/visual changes, M9 implementation changes, M10 execution, API/data
infrastructure, App Server client, reviewer agents, automatic backlog selection,
automatic acceptance, Git commit/push/merge or deployment. No extra framework or
execution dependency unless genuinely needed. Human review is required.

## Allowed statuses

`READY` → `IN_PROGRESS` → `NEEDS_REVIEW` or `BLOCKED`.
Only explicit human review may set `ACCEPTED`. This active infrastructure task
must not be executed recursively by its own runner.

## Completion and next step

M-AUTO2 implementation and verification are complete; see the declared report.
Human acceptance is pending. After acceptance, a human may prepare the dedicated
M10 — Async Data Foundation assignment as READY and run `npm run agent:run`.
M10 has not been started or made executable by this task.
