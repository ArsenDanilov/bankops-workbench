# M-AUTO2-SMOKE — Live Codex SDK Orchestrator Smoke Test (repeat 2)

## Status

BLOCKED

## Orchestrator stop

Task is BLOCKED; human input required.

spawn EPERM

## Goal

Repeat the approved documentation-only live SDK smoke after the scoped Git
preflight fix, without changing permissions or SDK execution strategy.

## Observed execution — 2026-09-04

The supervising task invoked `npm run agent:run` under Node 24.19.0 in the
existing restricted Windows environment. The actual Git-root preflight passed.
Required task/documents/scripts and SDK runtime resolved. The runner acquired
its lock and changed READY to IN_PROGRESS, then attempted SDK turn 1.

The run stopped with `spawn EPERM`, `threadId: null`, before any confirmed real
SDK thread/turn. The installed SDK's launch site in `dist/index.js` calls
`spawn(this.executablePath, commandArgs, { env, signal })`, with default pipes.
This is the next subprocess boundary; its precise underlying Windows denial has
not been further diagnosed or worked around. SDK source/settings were not edited.

Evidence: ignored runtime log
`.bankops-agent/2026-09-04T14-34-38.308Z-f3fbbb3d-aedc-4719-acf9-a888ba72b80a.jsonl`
contains IN_PROGRESS, `{ turn: 1, threadId: null, error: "spawn EPERM" }`, BLOCKED.

## Verification

- Git preflight: PASS, reached SDK execution stage.
- Supervisor's pre-smoke quality gate: lint/typecheck/test/build PASS;
  final full test run 121/121, 9 files. See the consolidated report for the
  earlier worker-timeout attempt, which was not counted as PASS.
- Real SDK turn: NOT completed or confirmed; threadId remains null.
- SDK-authored proof report: NOT produced. The runner created the BLOCKED stop
  report; the supervisor appended this factual evidence after process exit.
- Runner's independent quality gate: NOT reached, due to SDK launch failure.
- Task status: BLOCKED, set by runner. Never ACCEPTED or NEEDS_REVIEW.
- Runner exit code: 1. Active lock: absent after exit.
- Repair attempts: none. No elevation or alternative environment attempted.

## Files changed

This repeat changed only this report, current task status/stop note and the
ignored run log. The supervising task separately finalized its Git-fix report.

## Dependencies added

None.

## Browser and accessibility review

Not required; application/UI and accessibility behavior are unchanged.

## Architecture deviations

None. No SDK transport, permissions, authentication or security changes.

## Known issues and next decision

This smoke is BLOCKED, not implementation-complete or accepted. A separate human
decision is needed before diagnosing/changing the SDK's own subprocess launch
strategy or choosing another execution environment. No credentials or secret
files were read. Do not restart this task without explicit approval/READY.

## Historical sequence

- [Initial smoke](M-AUTO2-live-sdk-smoke.md): BLOCKED, preserved unchanged.
- [Windows verification fix](M-AUTO2-windows-verification-fix.md): preserved.
- [Repeat 1](M-AUTO2-live-sdk-smoke-repeat-1.md): BLOCKED, preserved unchanged.
- [Git fix and complete report](M-AUTO2-git-preflight-fix.md): local gate PASS.
- Repeat 2: BLOCKED at SDK launch, recorded only in this new report.
