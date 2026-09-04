# M-AUTO2 — Codex SDK Milestone Orchestrator

## Status

NEEDS_REVIEW

Implementation and local verification are complete; human acceptance is pending.
M9 human acceptance was recorded before implementation, retaining its original
report as history. No M10 execution or application change occurred.

## Goal

Provide `npm run agent:run` for one explicitly approved local milestone using the
official Codex TypeScript SDK, independent quality checks and bounded same-thread
repairs, with human-controlled acceptance and Git operations.

## Implemented

- Strict machine-field parsing for current milestone, Status and explicit Report.
- Read-only preflight and READY-only execution; no backlog selection.
- Local exclusive lock, scoped SDK adapter, structured Human Gate outcome.
- Independent quality commands, bounded failure diagnostics and three repairs.
- Report/task identity validation, BLOCKED failure recording and ignored logs.
- Deterministic fake-Agent tests, strict Node typechecking and operator docs.

## Files changed

- `automation/run-milestone.ts`: CLI, preflight, lock and execution lifecycle.
- `automation/lib/codex.ts`: official SDK boundary, structured outcome and prompt.
- `automation/lib/task.ts`: parsing, path/identity guards, status/report handling.
- `automation/lib/orchestrator.ts`: same-thread loop and final validation.
- `automation/lib/verification.ts`: script discovery and command results.
- `automation/lib/log.ts`: bounded-output log integration and credential redaction.
- `automation/orchestrator.test.ts`: 43 local tests; no live Codex service calls.
- `automation/README.md`: prerequisites, workflow, security limits and recovery.
- `package.json`, `package-lock.json`: approved dev tooling and agent:run script.
- `tsconfig.automation.json`, `tsconfig.json`: include Node runner in `tsc -b`.
- `.gitignore`: exclude `.bankops-agent/` runtime state.
- `AGENTS.md`, architecture and current-task docs: implemented workflow contract.
- M9 report: record explicit human acceptance, without implementation changes.
- This report: M-AUTO2 implementation and evidence.

Git diff confirms no changes in `src/`, existing Queue tests, `.github/`, Vite or
Vitest configuration, app/node TypeScript configurations or Product/visual specs.
Existing lint/typecheck/test/build script definitions are unchanged. Browser
bundles retain the existing names and sizes.

## Dependencies added

- `@openai/codex-sdk` **0.153.2**, development-only, explicitly approved.
- `@types/node` **24.13.3**, the one additional small tooling dependency: Node
  declarations were absent and strict runner typechecking initially failed with
  TS2688. Native Node 24 executes erasable TypeScript, so `tsx` is unnecessary.
- Transitive SDK CLI/platform runtime and Node declaration support are captured
  in the lockfile. Installation completed with 238 packages audited and zero
  reported vulnerabilities. No application dependency changed.

## Orchestrator flow

Read repository rules/task/baselines, validate Git root and safe paths, discover
quality scripts and resolve SDK runtime. Require READY, acquire the lock and
recheck identity/state. Set IN_PROGRESS, create one SDK thread and request the
complete approved milestone. After each completed turn, stop on Human Gate or
BLOCKED; otherwise independently verify. Repeat only verification repairs, then
validate the declared report and NEEDS_REVIEW before returning zero.

The prompt directs the agent to repository source-of-truth documents rather than
duplicating Product/Architecture specifications. No custom App Server client or
reviewer-agent infrastructure was introduced.

## State-machine behaviour

Only READY can start. IN_PROGRESS, NEEDS_REVIEW, BLOCKED and ACCEPTED refuse with
a nonzero exit code and no implementation invocation. A run transitions READY to
IN_PROGRESS, then NEEDS_REVIEW on success or BLOCKED on execution failure.

Automation cannot produce ACCEPTED. An observed ACCEPTED value is clearly flagged
and left untouched for human investigation, as are unrelated/malformed task
identities. Safe failure handling records BLOCKED and appends report diagnostics;
if unsafe, runtime logs record why the state update was refused. No automatic
retry of a blocked task or automatic crash recovery exists.

## Verification and repair loop

The runner captures command, exit code, stdout and stderr. Available scripts run
in fixed lint/typecheck/test/build order, including checks after an earlier
failure. Missing scripts are disclosed and zero available scripts fails preflight.
Definitions must match the preflight snapshot so a repair cannot silently remove
or replace checks.

`MAX_REPAIR_ATTEMPTS = 3` allows one implementation turn plus three repair turns.
Repeated `Thread.run()` calls preserve the same SDK thread. Failed output is
redacted and supplied as diagnostics, with an explicit scope/Human Gate reminder.
Each repair is followed by the complete available verification sequence. Gates,
SDK failures, invalid final state/report and exhausted repairs return nonzero.

Final validation checks only report presence/nonempty content, milestone/report
identity and NEEDS_REVIEW; it does not grade report prose or grant acceptance.

## Tests

Final checks on Windows, Node **24.19.0**, npm **10.9.3**:

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run test`: PASS — **7 files, 85 tests** (43 automation + 42 existing M9
  Queue tests); final run 11.59 seconds.
- `npm run build`: PASS — 49 modules, CSS 20.91 kB
  (`index-DAo41Vsg.css`), JS 254.94 kB (`index-De5J-XXl.js`).
- `git diff --check`: PASS; ordinary Git LF/CRLF conversion notices only.
- `git check-ignore .bankops-agent/probe.jsonl`: confirms runtime exclusion;
  no probe file was created.

Coverage includes inline/multiline/CRLF parsing and malformed metadata, all
non-executable statuses, safe paths, same-thread repair success and exhaustion,
success on the last repair, Human Gates, authentication errors, self-acceptance,
report presence/state/identity, failure-state preservation, script discovery and
change guards, exit-code handling, local process stdout/stderr and log redaction.
Tests use a fake Agent boundary, temporary local fixtures and tiny Node child
processes; none invoke the SDK service or a real implementation milestone.

Early TS errors (missing Node declarations and widened test literal types) and
one ESLint error (missing caught-error cause) were fixed. An intermediate Vite
plugin-timing advisory did not recur in the final build. Vitest's isolation-speed
advisory remains informational; isolation and M9 configuration were preserved.

## SDK/authentication behaviour

The installed SDK types/source and official
[SDK documentation](https://learn.chatgpt.com/docs/codex-sdk) informed the
`startThread` / repeated `Thread.run()` adapter and structured output validation.
The SDK resolves its native packaged CLI without a hardcoded host path.
`BANKOPS_CODEX_PATH` is an optional supported native-runtime override.

A separate read-only `codex login status` check returned **Logged in using
ChatGPT**, exit 0. No credential file was opened or copied. Supported local
authentication is inherited as described in the official
[authentication documentation](https://learn.chatgpt.com/docs/auth).
The runner never stores tokens or selects a new authentication method. SDK
authentication/permission errors become a stop requiring human input.

## Dry-run result

`npm run agent:run -- --dry-run` resolved the repository, task, all four quality
scripts and installed SDK runtime. Against the safe IN_PROGRESS M-AUTO2 state it
returned **exit 1**, explicitly requiring READY. This is the expected guard
result, not a failed implementation test. It did not launch Codex or M10.

A final repeat after the documentation transition to NEEDS_REVIEW also returned
the expected **exit 1** with the explicit READY requirement. SHA-256 hashes of all
tracked and nonignored untracked project files matched before/after the command;
`.bankops-agent/` was absent both before and after. No project-state mutation or
runtime-log creation occurred.

The first sandboxed attempt could not spawn Git (`spawnSync git EPERM`); the
read-only check succeeded in an approved process environment. No guard or project
script was weakened to avoid the host restriction.

## Real SDK smoke-test result

No real SDK implementation/model turn was performed. Authentication status,
installed runtime resolution and fake-boundary orchestration tests were checked;
they are not a live end-to-end service test. A live turn was unnecessary for the
required verification and would introduce service usage and workspace-write risk.
M10 was not used as an integration fixture and remains unstarted.

## Security / secrets review

- No keys, credential files, auth/environment dumps or raw SDK transcripts were
  added. The runner stores only redacted outcomes, thread IDs and verification
  diagnostics under ignored `.bankops-agent/`.
- Known secret-valued environment variables and common credential patterns are
  redacted before persistence and repair prompts. Command capture and repair
  excerpts are bounded. This is defense in depth, not arbitrary-secret detection;
  approved scripts/tasks must never print credentials or sensitive data.
- SDK workspace-write execution has no network/web search or automatic elevation.
  Independent npm checks are trusted host processes, not inside the SDK sandbox.
- Task/report paths cannot escape the repository via traversal/existing symlinks.
  Exclusive run locking prevents normal concurrent runner starts. No destructive
  Git command, commit, push, merge, publish or deployment was performed.

## Browser and accessibility review

Not required: no application, UI, font, layout, accessibility or visual behavior
changes. Existing Queue tests and bundle outputs remain unchanged. Browser review
was not performed or claimed.

## Architecture deviations

None from the approved SDK-based workflow. Explicit Report metadata, a small
orchestration module, locking and a separate Node TypeScript project implement the
allowed local design. The only extra tooling dependency is the required Node type
declarations; there is no execution framework or custom App Server integration.

## Known issues

- Live SDK implementation/repair behavior and hosted CI were not exercised.
- Default host shell Node is 22.19.0; verification used the available Node 24.19.0
  runtime. Operators must select Node 24 before invoking the npm script.
- Restricted subprocess/network execution required approved tool runs for npm
  installation, Vitest/Vite and the Git-root preflight. The initial SDK install
  needed `npm install --include=optional` to obtain the native platform package.
- SDK permissions may block an otherwise approved future task; this is a Human
  Gate, not permission to widen the sandbox automatically.
- Timeouts are bounded (60-minute turn, 10-minute quality command), but process
  descendants, hard interruptions and concurrent human edits are not transactional.
  A crash can leave IN_PROGRESS, a lock, partial edits or child processes. Manual
  inspection/recovery is documented; the runner never steals a lock or resumes
  a stale task automatically.
- Metadata/report checks establish workflow shape, not implementation quality or
  adversarial tamper resistance. Final scope/visual/content acceptance is human.

## Recommended next step

1. Human review and acceptance of M-AUTO2.
2. Separately prepare the complete **M10 — Async Data Foundation** assignment as
   the READY current milestone.
3. Run `npm run agent:run` for that approved task.

M10 has not been started. Suggested commit message:
`feat(automation): add Codex SDK milestone orchestrator`
