# M-AUTO2-SMOKE — Repeat 1

## Status

BLOCKED

This is a separate repeat attempt after the approved Windows verification fix.
The [initial BLOCKED smoke](M-AUTO2-live-sdk-smoke.md) is preserved unchanged.

## Goal

Repeat the live SDK smoke after a complete passing local quality gate, without
changing permissions, SDK sandbox, application behavior or historical reports.

## Execution result

`npm run agent:run` was invoked with Node 24.19.0 / npm 10.9.3 in the current
restricted environment. It returned **exit 1** with:

```text
spawnSync git EPERM
```

The unchanged `automation/run-milestone.ts` Git-root preflight uses
`execFileSync('git', ['rev-parse', '--show-toplevel'])`, which still needs stdio
pipes. Failure occurred before SDK construction/thread execution and before the
runner acquires a lock, writes runtime logs or changes READY to IN_PROGRESS.

No live SDK turn or independent runner quality gate occurred in this repeat.
The supervisor created this report and marked the repeat task BLOCKED after
the command failed. This is not an SDK-authentication failure or a passing smoke.

## Verification

The supervising implementation task ran the complete quality gate **before** this
attempt: lint PASS, typecheck PASS, test PASS (101 tests / 8 files), build PASS.
See the [consolidated report](M-AUTO2-windows-verification-fix.md) for full evidence.
Those checks are not presented as independent verification by this failed repeat.

## Files changed / dependencies

This repeat record and the current task status/stop note only. The approved fix
was already present before the attempt. No dependency or application change,
permission elevation, security-policy change, Git commit/push or M10 execution.

## Browser and accessibility review

Not required: no application or visual behavior changed.

## Architecture deviations / known issues

No new architecture change. The Windows verification adapter is fixed, but the
runner's own preflight/launch path has not been made compatible with stdio-pipe
restrictions. No alternative host, permission override or fix to that path was
attempted after this new gate.

## Recommended next step

Request a separate human decision on the runner's preflight/launch strategy.
Do not retry or mark this attempt PASS/ACCEPTED automatically. Any later retry
must have its own record so this result remains visible.
