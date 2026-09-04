# M9 — Implementation Report

## Status

NEEDS_REVIEW

M9 implementation and autonomous verification are complete. Human acceptance is
pending; M9 is not marked `ACCEPTED`.

## Goal

Add an automated quality safety net around Review Queue Visual Prototype v1
before the separately approved M10 data-source work.

## Implemented

- Added the approved React testing stack, deterministic `test` command and
  optional `test:watch` command.
- Added pure-logic, URL-hook and component/integration tests of existing Queue
  behavior and accessible interactions.
- Added a minimal GitHub Actions quality gate.
- Updated the active M9 task and architecture/backlog documentation. M-AUTO1's
  accepted report is preserved unchanged.
- No application behavior, visual design or production source changes.

## Files changed

- `package.json`, `package-lock.json`: five approved development dependencies;
  added test commands without changing lint/typecheck/build semantics.
- `vitest.config.ts`: test configuration merged with existing Vite configuration.
- `tsconfig.node.json`: include the test config in the existing typecheck.
- `src/test/setup.ts`: generic matchers, cleanup and browser-API stub.
- `src/pages/ReviewQueuePage/lib/reviewQueueSearchParams.test.ts`
- `src/pages/ReviewQueuePage/lib/filterReviewQueueItems.test.ts`
- `src/pages/ReviewQueuePage/lib/sortReviewQueueItems.test.ts`
- `src/pages/ReviewQueuePage/hooks/useReviewQueueSearchParams.test.tsx`
- `src/pages/ReviewQueuePage/ReviewQueuePage.test.tsx`
- `src/pages/ReviewQueuePage/ReviewQueueTable.test.tsx`
- `.github/workflows/quality-gate.yml`
- `docs/architecture/architecture-decisions.md`
- `docs/tasks/current.md`, `docs/tasks/backlog.md`
- `docs/reports/M9-quality-gate.md`

## Dependencies added

Development dependencies only (installed versions):

- `vitest` 5.0.0: test runner and mocking/timer APIs.
- `jsdom` 30.0.1: DOM test environment.
- `@testing-library/react` 16.3.3: component rendering and accessible queries.
- `@testing-library/user-event` 14.6.7: keyboard and pointer interactions.
- `@testing-library/jest-dom` 7.0.1: DOM/accessibility matchers.

No extra accessibility package was necessary for the requested component
assertions. Runtime dependencies are unchanged. No M10 packages were introduced.

## Test architecture

Vitest merges the existing Vite config so tests share React transforms and CSS
Modules support, using the documented
[Vite configuration integration](https://vitest.dev/config/). No separate Babel
or build pipeline was introduced.

Tests live beside Queue components, hooks and pure helpers, and are included by
the existing strict application TypeScript project. The test config is checked
by the Node TypeScript project. Vitest APIs are imported explicitly; focused
`.only` tests are disallowed. Isolation remains enabled, with at most two thread
workers for predictable resource use.

Global setup is generic: jest-dom matchers, DOM cleanup, timer/mock/global
restoration and a no-layout ResizeObserver API stub. No application fixtures or
Queue-specific providers are in global setup. Integration tests use MemoryRouter
with the actual AppRouter and Queue, plus a test-only location probe. Hook tests
exercise real router history, not mocked navigation calls.

User interactions use user-event. One deterministic timer-lifecycle test uses
fake timers and a synchronous fireEvent activation; separate incoming-case tests
cover full user-event clicks. This avoids coupling asynchronous input scheduling
to the application highlight clock. No fixed real-time sleeps, snapshots,
production test IDs or arbitrary coverage targets were added.

## Coverage added

- URL parsing: defaults, invalid/unknown values, deduplication, canonical order,
  retained nonblank search text, omitted defaults and unrelated-param preservation.
- URL controls: search/scope/SLA/risk page reset, deselection, Reset, page
  serialization, replace vs push and Back/Forward restoration.
- Filtering: Case ID, Operation ID, Client and Recipient search; whitespace/case
  normalization; scope/ownership distinctions; SLA; OR inside scope/risk groups
  and AND between groups; empty results and input immutability.
- Operational ordering: due time, created-time tie break, independent of score,
  without mutating the input array.
- Risk disclosure: native named button, keyboard opening, additional signal list,
  expanded/controls state, Escape/focus return, toggle, outside dismissal and
  only one row disclosure open at a time.
- Toolbar: pressed states, labeled native checkbox group, multi-select behavior,
  keyboard traversal without a trap, Escape/focus and outside dismissal.
- Incoming case: no timed automatic insertion; explicit activation; correct
  insertion order; retained URL/active filters; matching and filtered-out cases;
  a temporary presentation class that expires without removing the case.
- Current pagination: 10 initial / 11 incorporated / filtered / zero-result
  ranges, disabled controls and normalization of pages against the real dataset.
  No artificial production-sized dataset or server-pagination behavior was added.
- Semantics: root redirect, main/h1, table caption and seven column headers,
  search and Refresh accessible names, and busy/hidden skeleton semantics.

The production fixture set contains no other-analyst case; one local test variant
exercises that existing filter branch. The application fixture file is unchanged.

## CI

`Quality Gate` runs on pushes and pull requests with a single `ubuntu-latest` job,
Node 24, a ten-minute timeout and read-only repository permissions. Checkout does
not persist credentials. No matrix, deployment, coverage upload or caching setup.

Sequence: `npm ci` → `npm run lint` → `npm run typecheck` → `npm run test` →
`npm run build`. No step ignores failures. The workflow uses the official
[checkout v6](https://github.com/actions/checkout/tree/v6) and
[setup-node v6](https://github.com/actions/setup-node/tree/v6) actions.

YAML parsing was verified using the already-installed Prettier YAML parser;
read-only assertions checked the exact command sequence, Node 24, event triggers,
permissions and absence of failure suppression. Action refs/inputs were checked
against their official manifests. This is local/static validation, not a hosted
GitHub run. No push, workflow dispatch or branch-protection change was performed.

## Production changes made for testability

None.

## Verification

Verification used Node 24.19.0 and npm 10.9.3. The host's default Node is 22.19.0;
the already-available Node 24 runtime was selected for all npm installation and
quality commands without changing system settings.

- install: `npm ci` — PASS, exit 0; lockfile installation succeeded and npm
  reported zero vulnerabilities at that time.
- lint: `npm run lint` — PASS, exit 0.
- typecheck: `npm run typecheck` — PASS, exit 0.
- test: `npm run test` — PASS, exit 0; **6 files, 42 tests**, no failed/skipped
  tests in the final full run. Repeated full runs passed; the final bounded-worker
  run took 4.77 seconds.
- build: `npm run build` — PASS, exit 0; Vite transformed 49 modules. Output:
  CSS 20.91 kB and JS 254.94 kB; artifact names remain
  `index-DAo41Vsg.css` and `index-De5J-XXl.js`, as before M9.
- CI: YAML syntax and local assertions — PASS; hosted execution not performed.
- Diff: existing production `src` files, routing, fixtures, styles and
  `vite.config.ts` are unchanged. New `src` files are exclusively tests/setup.
  Package runtime dependencies and existing script semantics are unchanged.
- Formatting/whitespace: changed/new files reviewed with Prettier and Git diff
  checks. No commit or push performed.

## Browser review

Not required; see browser regression review below.

## Browser regression review

Not performed because production application code and visual assets are unchanged.
Component tests are not a substitute for the existing 1440 × 900 visual review
when future UI changes occur.

## Accessibility review

Automated assertions protect native controls, names, table structure, disclosure
state, keyboard traversal and focus behavior. They do not certify screen-reader
behavior, contrast, actual layout/truncation, glass rendering or reduced-motion
preference handling. The M8 visual/accessibility decisions remain unchanged.

## Architecture deviations

None. No production refactors, M10 technology, API client, backend, global store,
new application route or visual change. No SDK/orchestrator was implemented.

## Known issues

- Network installation and Vite/Vitest subprocess startup required approved runs
  outside the local sandbox (`ENOTCACHED` / `spawn EPERM`). These restrictions were
  not bypassed in project scripts or CI.
- The initial default fork-worker smoke run stalled locally; thread workers
  completed. One later cold run passed after 63.65 seconds, mostly environment
  startup. The final configuration bounds concurrency to two workers and retains
  isolation. No failing or intermittently failing assertion remains observed.
- An early fake-timer/user-event test timed out. It was repaired by separating
  clock-lifecycle checks from asynchronous user interactions; the repaired test
  and the full suite pass without extending timeouts.
- Vitest prints an advisory about faster runs with isolation disabled; isolation
  intentionally remains enabled. One intermediate build printed a CSS plugin
  timing advisory; the final build passed without it. No warnings were suppressed.
- CI has not yet run on GitHub. Local YAML checks do not prove hosted runner or
  repository branch-protection configuration.
- jsdom does not provide actual layout. ResizeObserver is a generic API stub;
  truncation, scroll stability, colors and material effects need later browser/E2E
  verification. Inter/Segoe reconciliation remains deferred visual calibration.

## Recommended next step

Human acceptance of M9, followed by a separately approved
**M-AUTO2 — Codex SDK Orchestrator** milestone. Do not begin M-AUTO2 automatically.
M10 — Async Data Foundation remains separate and was not started.
