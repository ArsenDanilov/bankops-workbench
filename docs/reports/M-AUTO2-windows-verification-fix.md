# M-AUTO2 — Windows verification fix and repeat smoke

## Status

BLOCKED

The approved project-level fix and local quality gate are complete. The separately
prepared repeat hit a new preflight gate before SDK execution; full end-to-end
completion is BLOCKED. No human acceptance is claimed. This report consolidates
the initial failure, fix and repeat result.

## Cause and history

1. [Initial live smoke](M-AUTO2-live-sdk-smoke.md): BLOCKED, runner exit 1 after
   the SDK agent reported a permissions Human Gate. This historical file is not
   modified. Its SHA-256 is
   `E12E89770A6EDF8E2F23C9E448895958A807BDB9FC74D4C9058F3D8E22ABC2AA`.
2. Diagnosis reproduced the failure without SDK/runner: Vite 8.2.2's bundled
   config loader called `exec("net use")` via `cmd.exe /d /s /c`, failing with
   `spawn EPERM` in Windows stdio-pipe setup before Vitest workers started.
   Node 22/24 child-process probes failed with pipes but succeeded with inherited
   handles or file descriptors; worker_threads worked. The precise Windows
   policy/ACL was not established. Native config loading yielded 82/85 passing
   tests; the remaining three failed in the runner verification adapter's pipes.
3. The human then explicitly approved native config loading, Windows descriptor
   capture, tests/documentation and a separate repeat without elevated rights.
4. [Repeat 1](M-AUTO2-live-sdk-smoke-repeat-1.md): BLOCKED at the unchanged runner
   Git-root preflight (`spawnSync git EPERM`, exit 1), before a new SDK turn.

## Implemented fix / files changed

- `package.json`: test remains the complete Vitest run and build remains
  `tsc -b` plus Vite production build, both with Vite's supported native config
  loader. This matches Node 24's native TypeScript support; no dependency added.
- `automation/lib/verification.ts`: Windows uses shell-free spawn with temporary
  stdout/stderr descriptors, other platforms keep execFile/pipes. Capture retains
  real exit codes, both streams, 10-minute timeout, 1 MiB per-stream read limits
  and secret redaction before results/logs. Launch failures have null exit code.
  Synchronous exceptions become structured results rather than rejected promises.
- Temporary capture files/descriptors are cleaned in finally paths, including
  partial setup, launch/read failures, timeout and overflow. Cleanup errors fail
  verification; a zero subprocess exit cannot hide an infrastructure error.
- `automation/lib/orchestrator.ts`: failed-result selection uses the same success
  predicate as verification, so infrastructure errors also reach the unchanged
  bounded same-thread repair loop. No changes to the three-repair ceiling,
  Human Gates, acceptance rules or SDK configuration.
- `automation/verification.test.ts`: real descriptor capture on every platform,
  errors, cleanup, timeout, output limits, redaction and the preserved pipe adapter.
- `automation/orchestrator.test.ts`: one additional infrastructure-error repair
  test; all prior repair-loop and Queue tests retained.
- `automation/README.md` and architecture decisions: factual workaround and its
  limits. `docs/tasks/current.md` prepares only the separately approved repeat.
- This consolidated report and the separate repeat report record the transition.

## Verification

Commands ran with Node 24.19.0 / npm 10.9.3 in the current restricted environment,
without an escalated tool execution or permission change:

- `npm run lint`: PASS, exit 0.
- `npm run typecheck`: PASS, exit 0.
- `npm run test`: PASS, exit 0 — 8 files, **101 tests**, final run 25.80 seconds.
- `npm run build`: PASS, exit 0 — 49 modules; unchanged browser output names/sizes:
  `index-DAo41Vsg.css` 20.91 kB and `index-De5J-XXl.js` 254.94 kB.
- `git diff --check`: PASS. Application, Product/Visual, package-lock, existing
  Vite/Vitest configuration and GitHub Actions workflow have no changes.

The added coverage checks success and nonzero exits, missing executable,
synchronous spawn/execFile exceptions, partial setup/read/cleanup failures,
timeout cleanup, both-stream overflow, continuous output, secret redaction and
repair of exit-zero infrastructure failures. Early implementation failures
(Windows launch-error code normalization, a filesystem spy and a test literal
type) were fixed before the final gate.

One intermediate full run encountered a Vitest worker startup timeout: 88 tests
passed but one Queue test file did not execute, so that run failed and was not
counted as a passing gate. An unchanged sequential rerun executed all 101 tests
successfully. No timeout, pool, isolation or assertion was weakened. The build
emitted an informational Vite plugin-timing advisory; Vitest retained its usual
isolation-performance advisory.

## Repeat live SDK smoke

After the passing quality gate, `npm run agent:run` was invoked for the READY
repeat task with Node 24, without escalation. It exited 1: `spawnSync git EPERM`.
The unchanged `execFileSync('git', ['rev-parse', '--show-toplevel'])` in
`automation/run-milestone.ts` still creates stdio pipes and failed during Git-root
preflight. The verification adapter fix does not change this separate call site.

The repeat did not reach SDK/thread creation, independent verification, lock or
runtime-log creation. No authentication diagnosis can be inferred from this
failure. In compliance with the user's stop condition, no permission override,
alternate environment, preflight edit or further launch was attempted. The
supervisor recorded the repeat as BLOCKED in its own report and current task.

History is therefore: **initial live smoke BLOCKED → diagnosed/verified project
fix → repeat launch BLOCKED before SDK**. Initial report hash remains unchanged.

## Security and limitations

- No new dependencies, permissions, sandbox changes, application changes, Git
  commit/push or M10 work. No credential files or environment dumps were read.
- Capture files temporarily contain command output and are not retained as logs;
  returned results and persisted diagnostics are redacted. Commands must not
  print secrets. Requested mode 0600 does not replace Windows inherited ACLs.
- Output is checked every 20 ms and again after exit. Reads are hard-bounded;
  transient disk usage can exceed the threshold between polling samples.
- Cleanup is attempted on every handled path; hard process termination or OS
  refusal can prevent cleanup. Cleanup failures are surfaced, not suppressed.
  Descendant processes remain outside the existing v1 supervision contract.
- GitHub Actions YAML is unchanged and uses Node 24. CI receives the same native
  loader flags via npm scripts, and tests exercise descriptor capture on all
  platforms. Hosted CI/Linux execution was not performed here.
- Browser review is not required: application/UI behavior did not change.

## Sources and next step

The implementation follows the supported
[Vite native config loader](https://vite.dev/config/#config-loading); official
[OpenAI SDK documentation](https://learn.chatgpt.com/docs/codex-sdk) was consulted
to retain the existing SDK thread/authentication approach without a custom client.

Review the completed verification fix and authorize a separate investigation/fix
of the runner's own Git-preflight/launch strategy if desired, without changing
security permissions. Do not silently reset or retry the BLOCKED repeat.
Suggested commit message:
`fix(automation): support Windows sandbox verification capture`
