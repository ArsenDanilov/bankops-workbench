# M-AUTO2 — Git preflight fix and repeat-2 report

## Status

BLOCKED — Git fix and full local gate complete; repeat 2 hit a new SDK launch gate.
This is not human acceptance.

## Goal

Apply the explicitly approved project-level fix for `spawnSync git EPERM`, keep
the real Git-root guard and repeat the same live SDK smoke without elevation.

## Root cause

Repeat 1 called `execFileSync('git', ['rev-parse', '--show-toplevel'])` in
`automation/run-milestone.ts`. That default pipe-based subprocess launch failed
with `spawnSync git EPERM` before SDK execution. It belongs to the Windows
subprocess/stdio limitation previously isolated for Vite and verification.
The exact Windows policy/ACL causing EPERM has not been established; this is not
evidence of a broken repository or a Vitest assertion failure.

## Implemented

- Extracted the existing transport into `automation/lib/command.ts`, without
  changing capture behavior: Windows file descriptors, other platforms execFile
  pipes, real exit codes, stdout/stderr, timeout, bounds, redaction and cleanup.
  Verification imports it and keeps its public reexports for existing callers.
- Added `automation/lib/git.ts` and awaited it in runner preflight. It still runs
  `git rev-parse --show-toplevel`; there is no `.git` or cwd heuristic fallback.
  Git uses a 30-second timeout and 64 KiB per-stream bound. Failure, malformed
  output, missing/non-directory roots or a different canonical root stop the run.
- Native realpath canonicalization expands Windows 8.3 aliases on both sides.
  Tests initially exposed TEMP short-name versus Git long-name differences;
  canonicalization fixed that while nested/wrong-root refusal remains tested.
- Existing state, lock, SDK, security and repair-loop guards are unchanged.
  Temporary Git captures are also cleaned during dry-run; no project-state write
  is introduced by preflight itself.

## Files changed in this task

- `automation/lib/command.ts` — shared existing capture primitive.
- `automation/lib/verification.ts` — reuse/reexports, no duplicate transport.
- `automation/lib/git.ts` — bounded real Git-root validation.
- `automation/run-milestone.ts` — await Git preflight.
- `automation/git.test.ts` — 20 focused tests.
- `automation/README.md` and `docs/architecture/architecture-decisions.md` —
  implemented workaround and limits.
- `docs/tasks/current.md` — repeat-2 workflow state.
- This report and `docs/reports/M-AUTO2-live-sdk-smoke-repeat-2.md` — new evidence.

Pre-existing verification-fix changes are preserved. This task does not add new
changes to package scripts, dependencies, application, Product/Visual baselines,
CI, test configuration, SDK adapter or M10.

## Dependencies added

None.

## Verification

Node 24.19.0, npm 10.9.3, Windows, existing restricted permissions.

- Focused automation tests: PASS, 79/79 across three files, including 20 new
  Git tests and unchanged capture/repair coverage.
- lint: PASS, exit 0.
- typecheck: PASS, exit 0.
- test: initial full attempt failed with two worker-startup timeouts; 107 tests
  passed but two Queue test files did not start. This is not counted as PASS.
  Unchanged-command rerun: PASS, exit 0, 121/121 tests across 9 files (11.42 s).
  No isolation/timeout/security settings changed.
- build: PASS, exit 0; 49 modules, CSS 20.91 kB, JS 254.94 kB. Bundle names remain
  `index-DAo41Vsg.css` and `index-De5J-XXl.js`. Plugin timing warning is advisory.
- Git diff scope check: no application/Product/Visual/SDK/CI/lockfile changes.
  All three historical reports match their pre-task SHA-256 hashes.

Git tests cover real resolution (including path spaces), platform-default and
Windows descriptor transport, capture cleanup, nonzero Git result, missing
executable, synchronous spawn failure, malformed output, nonexistent/file/wrong
roots and refusal of nested/non-repositories even with an empty `.git` directory.
Existing capture tests cover timeout/error cleanup, output overflow, redaction,
pipe adapter and structured failure; existing repair-loop tests remain in scope.

## History and repeat 2

1. [Initial smoke](M-AUTO2-live-sdk-smoke.md): BLOCKED; historical real SDK turn.
2. [Windows verification fix](M-AUTO2-windows-verification-fix.md): historical
   implementation/gate evidence, retained unchanged.
3. [Repeat 1](M-AUTO2-live-sdk-smoke-repeat-1.md): BLOCKED at Git preflight.
4. This separately approved Git fix: full local gate PASS.
5. [Repeat 2](M-AUTO2-live-sdk-smoke-repeat-2.md): BLOCKED at SDK launch.

The exact `npm run agent:run` invocation passed Git preflight, resolved the SDK
runtime and acquired the run lock. READY changed to IN_PROGRESS. Attempt 1 then
failed with `spawn EPERM`, `threadId: null`; no real SDK turn was confirmed.
The runner wrote a BLOCKED stop report, set the task BLOCKED, released its lock
and exited 1. Its independent quality sequence was not reached. The supervisor
appended evidence to the new report; it is not an SDK-authored proof artifact.

Log: `.bankops-agent/2026-09-04T14-34-38.308Z-f3fbbb3d-aedc-4719-acf9-a888ba72b80a.jsonl`.
Read-only inspection of installed SDK code identifies its default-pipe native
CLI spawn boundary. Its transport was not changed or bypassed. No elevated
command, retry, SDK patch or alternative execution environment was attempted.
The smoke is not implementation-complete and is not ACCEPTED.

Historical SHA-256 values, unchanged before/after this task:

- Initial: `E12E89770A6EDF8E2F23C9E448895958A807BDB9FC74D4C9058F3D8E22ABC2AA`.
- Repeat 1: `502FBED413C3D14A57DD5A506D1841A54342A3BF0CD7EA0688DAA621824D8AB9`.
- Verification fix: `A25DCDA7BE63F281A07350EE248764A2FF875CB3ABC2C8C3EEB3015E9DA34ED2`.

## Browser review

Not required: no visible application change.

## Accessibility review

No application markup, interaction or accessibility behavior changed.

## Architecture deviations

None beyond the expressly approved small shared subprocess extraction. No
sandbox/security weakening, elevation, dependency, SDK transport or CI changes.

## Known issues

The underlying Windows policy remains unidentified. Existing capture limits
remain: polling permits transient disk overshoot; hard-killed parents/OS cleanup
denial may leave temporary files; descendant supervision is outside runner v1.
No secrets or credential files were read for this task.

## Recommended next step

Human decision on separately scoped diagnosis of the SDK's own subprocess launch.
Do not broaden the fix, elevate permissions or rerun the BLOCKED task without
approval. The Git fix is ready for review; live-smoke completion remains blocked.

Suggested commit: `fix(automation): reuse safe capture for Git preflight`.
No commit or push was performed.
