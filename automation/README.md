# Local milestone runner

M-AUTO2 adds a small local development runner, not product infrastructure. It
executes only the explicitly approved current task through the official Codex
TypeScript SDK. It does not select backlog work, accept milestones, commit, push,
merge, deploy or run reviewer agents.

## Prerequisites

- Node **24.x**, npm and Git on PATH; a trusted local Git checkout.
- `npm ci`, including optional platform packages for the SDK's Codex CLI runtime.
- Supported local Codex authentication. Use `codex login` if needed and confirm
  with `codex login status` separately; the runner never reads credential files or
  offers a custom credential store. Local authentication/configuration is inherited
  by the SDK. Authentication/permission failures stop the run for human input.
- If the packaged CLI cannot be resolved, reinstall with optional dependencies.
  Alternatively, set `BANKOPS_CODEX_PATH` to the **absolute native executable** of
  an installed supported Codex CLI (not a `.cmd`/shell wrapper). This is passed to
  the SDK's supported `codexPathOverride`; no machine-specific path is committed.
- `@types/node` supplies Node 24 declarations for strict typechecking. Native
  Node TypeScript execution means no `tsx`, transpiler service or framework.

SDK operations use `workspace-write`, no network/web search and approval policy
`never`: elevation is unavailable, not automatically approved. A task requiring
additional permissions must stop at a Human Gate. Model settings are inherited;
there is no model override, custom App Server transport or credential override.
The independent npm scripts run as ordinary trusted local processes, outside the
SDK sandbox; review their definitions and the checkout before running automation.

## Prepare a task

A human supplies the complete approved scope and source-of-truth links in
`docs/tasks/current.md`, including these unique fields **above the first `##`
heading** (inline values or values on the next line are supported):

```markdown
# Current implementation milestone

Current milestone:
M-EXAMPLE — Approved implementation

Status: READY

Report: docs/reports/M-EXAMPLE.md

## Approved scope

The dedicated approved task and source-of-truth links go here.
```

`Report` must be a milestone `.md` filename directly under `docs/reports/`, not
README. Repository paths and existing ancestors must remain within the checkout.
Malformed, missing or duplicate metadata fails closed. Required baseline documents
must exist and be nonempty. The model is instructed to read all task references.

## Commands

```sh
npm run agent:run -- --dry-run
npm run agent:run
```

Dry run reads the task, required documents, Git root and available npm quality
scripts, and constructs the SDK to resolve the runtime. It does **not** start a
thread, invoke the Codex executable/service, verify authentication, run quality
scripts, create logs/locks, or change project state. READY returns zero; a
non-executable state or failed prerequisite returns nonzero. An expected refusal
for NEEDS_REVIEW/IN_PROGRESS is a safe way to test the guard.

Git preflight always runs `git rev-parse --show-toplevel` and requires its real,
canonical directory to equal the runner repository root. Empty/multiline/relative
output, nonexistent roots, non-repositories, nested runner locations and command
or capture failures refuse execution. There is no `.git`-presence fallback.
Git uses a 30-second timeout and 64 KiB per-stream output bound. On Windows,
including dry-run, transient OS-temp capture files are created and cleaned; no
project state is changed by this check.

## Lifecycle and verification

1. Only `READY` may start. IN_PROGRESS, NEEDS_REVIEW, BLOCKED and ACCEPTED refuse.
2. Acquire an exclusive local lock, recheck task identity/state and set
   IN_PROGRESS. Start one local SDK thread and wait for its implementation turn.
3. Read the structured outcome and current task. A Human Gate/BLOCKED stops
   immediately, without verification or repair. Unexpected ACCEPTED is flagged
   as an error and left untouched for human investigation.
4. Independently run the available scripts, in order: lint, typecheck, test,
   build. Missing scripts are disclosed, never counted as passing; zero scripts
   is an error. All available checks run even after a failed check. Definitions
   must match the preflight snapshot; changing/removing them is a Human Gate.
5. On failed verification, send the failed commands, exit codes and redacted
   output to **the same Thread.run()**. Repeat the complete available sequence.
   `MAX_REPAIR_ATTEMPTS = 3` in `lib/orchestrator.ts` permits at most four turns
   total. SDK/authentication failures are not retried.
6. Success also requires the original milestone/report identity, a nonempty
   report at the declared path and task status NEEDS_REVIEW. This is presence/state
   validation, not natural-language grading. Invalid final contracts stop.
7. On execution failure, return nonzero, preserve diagnostics, mark the same task
   BLOCKED and append a stop note to its report where safe. Never overwrite an
   unrelated, malformed or ACCEPTED task. Such state conflicts require human
   investigation and are recorded in the runtime log.

Only a human accepts NEEDS_REVIEW or resolves BLOCKED. The runner never
automatically resets a task to READY or proceeds to another milestone.

## Logs, limits and recovery

`.bankops-agent/` is gitignored and holds a per-run JSONL log plus `active.lock`.
Logs include thread ID, outcomes and command/exit-code/stdout/stderr diagnostics,
not SDK item transcripts, environment dumps or authentication/configuration
files. Secret-valued environment variables and common credential formats are
redacted before logging, console errors and repair prompts. Output is bounded to
1 MiB per command stream and 16,000 characters per failed stream in repair
prompts. Redaction is defense in depth, not a guarantee for arbitrary unknown
secrets: tasks/scripts must not print credentials or sensitive data. SDK-owned
session storage remains managed by Codex, not by this runner.

Each SDK turn has a 60-minute timeout; each verification command has a 10-minute
timeout and reports startup/timeout/buffer errors as failures. The runner is not
a security boundary or service supervisor. Hard interruption, process-tree
termination and concurrent external edits are not transactional. A killed process
may leave IN_PROGRESS, its lock, partial edits or descendant processes. Inspect
processes, Git diff, task/report and logs before manually removing **that run's**
lock and explicitly restoring READY. Do not remove a lock while its process runs.
There is no automatic crash recovery/resume; same-thread repairs apply to a single
live run. Do not edit task metadata concurrently with an active run.

## Windows subprocess compatibility

The initial [live smoke](../docs/reports/M-AUTO2-live-sdk-smoke.md) remains a
historical BLOCKED result. Diagnosis reproduced `spawn EPERM` in Windows stdio
pipe creation: Vite's config bundler called `exec("net use")` before Vitest workers
started. A minimal child process with file descriptors worked under the same
permissions; the exact underlying Windows policy/ACL was not identified.

The approved project-level workaround is limited to:

- `test` and the Vite part of `build` use the supported `--configLoader native`
  option with Node 24. They still execute the entire test suite and production
  build. Test pool, isolation, assertions and CI workflow are unchanged.
- Shared `lib/command.ts`, used by verification and Git preflight, uses `spawn`
  with stdout/stderr file descriptors on Windows;
  other platforms retain `execFile` with pipes. No shell or new permissions are
  introduced. SDK execution/security settings are unchanged.
- Each Windows command gets a uniquely created OS-temp directory and exclusive
  capture files (requested mode 0600; Windows inherits OS access controls). Output
  is transiently written verbatim there, then redacted before returning results
  or persisting JSONL logs. Commands must not print secrets. No raw capture is
  intentionally retained; descriptors, both files and the exact temp directory
  are cleaned on completion, launch/setup errors, timeout and output-limit errors.
  Cleanup errors explicitly fail the command. A hard-killed parent or OS denial
  can still prevent cleanup; this is not secure erasure or a sandbox boundary.
- Each stream is monitored every 20 ms and the process is terminated on overflow;
  a final size check catches short-lived output bursts. Verification reads are
  capped at 1 MiB per stream; Git preflight uses 64 KiB. Temporary disk usage can
  overshoot between samples, unlike the hard read limit. The command deadline
  (10 minutes for verification, 30 seconds for Git) requests SIGTERM; on Windows
  Node uses forceful termination. Descendants remain outside v1 supervision.
- A command result retains its real process exit code (null if launch failed),
  stdout/stderr and an optional `error` for launch/capture/timeout/limit/cleanup
  failures. Synchronous spawn/execFile exceptions become structured results.
  Exit 0 with an infrastructure error is **not** success and enters the same
  bounded repair loop; Human Gates still stop it immediately.

The new capture tests exercise real file-descriptor transport on every platform
and mock the pipe adapter for deterministic error coverage on restricted Windows.
No dependencies, Windows policies, sandbox modes or quality checks were changed.

Repeat 1 stopped at the former `execFileSync('git', ...)` pipe-based preflight.
The separately approved Git fix reuses the capture primitive without changing
its transports, result contract or cleanup. Git errors stop before SDK/task/lock
creation; they never trigger verification repairs. Focused Git tests use real
temporary repositories plus injected failure/malformed-result cases. Historical
smoke results remain immutable; repeat 2 is recorded separately.

## Tests and human responsibilities

`npm run test` includes Node-environment deterministic orchestration tests using
a fake Agent boundary and local temporary files/processes. They never call the
Codex service or execute a real milestone. Existing Queue tests remain unchanged.
`npm run lint`, `npm run typecheck` and `npm run build` include automation checks
without including automation in the browser bundle.

Human review still owns approval/scope, authentication choices, acceptance,
permission/dependency gates, Git operations and preparing the next dedicated task.
M10 is not a test fixture or automatically approved by installing this runner.
