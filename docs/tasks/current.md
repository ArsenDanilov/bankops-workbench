# Current implementation milestone

Current milestone:
M-AUTO2-SMOKE — Live Codex SDK Orchestrator Smoke Test (repeat 2)

Status: BLOCKED

Report:
docs/reports/M-AUTO2-live-sdk-smoke-repeat-2.md

## Approved assignment

The human explicitly approved the scoped Windows-safe Git-preflight fix and
one further real smoke via `npm run agent:run`. The supervising task completed
the fix and full local quality gate (lint/typecheck/test/build PASS, 121 tests)
before making this repeat READY. This is not M10 or another implementation.

This is a documentation-only live SDK smoke. Read AGENTS.md, this task,
docs/architecture/architecture-decisions.md, automation/README.md,
docs/reports/README.md and docs/reports/M-AUTO2-git-preflight-fix.md.
Read referenced Product/Visual baselines as required, without changing them.

## History to preserve

1. Initial smoke: [BLOCKED](../reports/M-AUTO2-live-sdk-smoke.md).
2. [Windows verification fix](../reports/M-AUTO2-windows-verification-fix.md).
3. Repeat 1: [BLOCKED](../reports/M-AUTO2-live-sdk-smoke-repeat-1.md).
4. [Approved Git-preflight fix](../reports/M-AUTO2-git-preflight-fix.md).
5. Repeat 2: write only the new declared report and update this task's status.

Do not edit or overwrite historical reports or the supervising fix report.
Preserve all existing implementation changes in the working tree.

## Required execution

Create the declared nonempty report using the standard report contract. It is
the sole proof write; do not create marker files. Read the approved project
sources and run the unchanged-in-purpose lint, typecheck, test and build scripts.
Record actual results only. The runner independently repeats these checks after
your turn; do not claim its future results in your report.

Finish at NEEDS_REVIEW only if your work completes without a Human Gate.
Never set ACCEPTED. Keep milestone and Report identity unchanged.
Success requires a real SDK turn, report creation, independent quality gate PASS,
NEEDS_REVIEW and runner exit 0; human acceptance remains separate.

## Scope and security

Only the new repeat report and this task's status/stop note may be changed by the
SDK turn. No application, Product/Visual, dependency, CI, orchestration code,
test configuration, process strategy, security policy or permission changes.
No M10, commits, pushes, deployments or recursive runner invocation.

The human permits sending necessary project files and command output to OpenAI
Codex for this smoke only. Never read or transmit credentials, credential files,
.env files, API keys, tokens, environment dumps or other sensitive data.
Keep the existing supported local authentication and SDK sandbox settings.

If a new security/permission/human gate occurs, STOP and mark BLOCKED with the
exact evidence and decision needed. Do not elevate permissions, bypass guards,
weaken checks, change the runner or try an alternative execution environment.

## Repeat 2 stop

The approved invocation passed the real Git preflight and resolved SDK/runtime,
then failed on SDK turn attempt 1 with `spawn EPERM`, `threadId: null`.
The runner set BLOCKED, wrote the declared stop report and exited 1; its lock
was released. No real SDK turn or independent runner quality gate completed.

The supervisor's full local gate passed (121 tests). That is not a successful
live smoke. Work stopped at this new SDK-launch permission/execution boundary;
separate human approval is required for any further diagnosis or strategy change.
Historical reports remain unchanged. See the declared repeat-2 report and
the consolidated Git-preflight fix report for exact evidence.
