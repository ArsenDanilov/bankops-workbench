# BankOps — Architecture Decisions v1

## Implemented baseline

- Vite 8 + React 19.2 + TypeScript 5.9 with strict checking; npm and Node 24.x
  (`package.json` specifies `>=24 <25`).
- React Router v7 **Declarative Mode**: `BrowserRouter`, `Routes`, `Route`, and
  `Navigate`. `/` redirects to `/review-queue` with replace. AppShell owns the
  layout; Review Queue is the only implemented destination. No Data Router,
  framework-mode routing, Workspace route or Case History route yet.
- CSS Modules for component styles; application-level reset/globals and CSS custom
  properties for semantic tokens. No Tailwind or CSS-in-JS.
- Native semantic HTML table with explicit column geometry. No TanStack Table,
  virtualized grid or generic table abstraction.

## State and data boundaries

- URL parameters own Queue search, scope, SLA, risk filters and page. The
  `useReviewQueueSearchParams` hook parses/serializes URL state; pure helpers
  filter and sort the derived list. See [Queue behavior](../visual/review-queue.md).
- Local React state owns transient UI: toolbar panel visibility, the open row
  risk popover, actual truncation/tooltip visibility, pending incoming fixture
  incorporation and its highlight timer. Do not move these into URL state or a
  speculative global store.
- `ReviewQueueItem` is the typed Queue projection, not a full ReviewCase model.
  It separates lifecycle, ownership, SLA state and risk signals/score, with IDs,
  timestamps, amount/currency and display names needed by the Queue.
- Local typed fixtures currently provide ten initial items and one separate
  incoming item. Queue operations derive display data without server calls.
- Loading remains a presentation state; header refresh and timestamps are not
  backed by an asynchronous request.
- No Redux/Zustand or other global client state store. Avoid premature shared
  abstractions, generic UI-kit components and speculative domain models.

## Planned, not implemented

The approved Async Data milestone (M10) is the boundary for TanStack Query for
async server state, MSW for the mock API and native `fetch` for requests. These
are plans, not installed capabilities or authorization to add dependencies now.
Do not replace routing, styling or URL-state ownership as part of that work
without an explicit architecture decision. Axios and backend infrastructure are
not part of the current baseline.

## Testing and quality roadmap

- Existing checks: ESLint (`npm run lint`), TypeScript (`npm run typecheck`),
  Vitest (`npm run test`) and production build (`npm run build`); Prettier is
  installed. `test` runs once; `test:watch` is the optional local watch command.
- M9 adds Vitest with jsdom, React Testing Library, user-event and jest-dom. Its
  separate test config merges the existing Vite config and uses at most two
  isolated thread workers (the default fork worker stalled on the local Windows
  host). Isolation remains enabled.
- Tests are colocated with Queue components, hooks and pure helpers. The generic
  `src/test/setup.ts` registers matchers, cleans up rendered trees, restores
  mocks/timers/globals and supplies a no-layout ResizeObserver stub for jsdom.
  Application fixtures are not part of global setup. No production refactor is
  required. Test code and configuration participate in TypeScript checking.
- GitHub Actions runs a single Node 24 job for pushes and pull requests:
  `npm ci` → lint → typecheck → test → build. No deployment or coverage service.
- M9 is human-accepted (recorded in its report). M-AUTO2 adds the separately
  approved local workflow runner described below; it does not change application
  architecture. M10 remains the async-data milestone; E2E/final quality remains
  later backlog work.
- Visible UI changes require browser self-review at the relevant specification's
  viewport, including console, keyboard, states and material fallbacks.
- Every milestone ends with factual verification and a standardized
  [report](../reports/README.md), followed by human review.

## Local milestone automation — M-AUTO2

- Official `@openai/codex-sdk` TypeScript SDK, native Node 24 TypeScript execution
  and Node type declarations. No custom App Server JSON-RPC client, agent/workflow
  framework, backend, GUI or reviewer agent.
- `automation/` is development-only. One explicit READY task becomes IN_PROGRESS;
  one SDK thread implements it and handles up to three verification repairs via
  repeated `Thread.run()`. No automatic backlog selection, crash resume or M10 run.
- Independent existing npm quality scripts run in lint/typecheck/test/build order,
  with captured results. Definitions cannot silently change during the run. Final
  validation checks declared report presence, task identity and NEEDS_REVIEW;
  report content quality and ACCEPTED remain human-owned.
- Local supported Codex authentication is inherited, never copied into project
  storage. The SDK workspace-write sandbox has no network/web search or elevation;
  missing authority/authentication is a Human Gate. Independent quality commands
  remain trusted host processes, not sandboxed by the SDK.
- Read-only dry-run checks state/files/Git/scripts/runtime without invoking Codex.
  Ignored `.bankops-agent/` holds a lock and redacted bounded diagnostics. This is
  a local single-run helper, not a transactional scheduler/security boundary.
- Node-environment fake-Agent tests share the existing test command without
  changing M9 Queue tests or their jsdom configuration. A dedicated automation
  TypeScript project is included in `tsc -b`; no automation ships to the browser.

Operational prerequisites and recovery limits: [automation/README.md](../../automation/README.md).

### Approved Windows verification workaround

The first live smoke remains historically BLOCKED. Diagnosis isolated Windows
`stdio: pipe` failures: Vite's bundled config loader invoked `net use`, and the
verification adapter's own `execFile` calls also failed under the restricted
environment. This was not a Vitest thread-pool failure.

The approved fix uses Node 24's native config loader for test/build and Windows
file-descriptor capture for verification subprocess output. Other platforms keep
the pipe adapter. Commands, complete test coverage, isolation, real exit codes,
timeouts, output limits, redaction and the three-repair ceiling remain enforced.
Capture/cleanup errors are explicit failures even if a child exits zero. Temporary
captures are cleaned in finally paths; polling disk-limit overshoot and hard-stop
cleanup limitations are documented in the runner instructions. This does not
change SDK permissions, authentication, CI workflow or application architecture.

### Approved Windows Git-preflight workaround

Repeat 1 stopped before SDK creation at `execFileSync('git', ...)` with EPERM,
consistent with the diagnosed Windows stdio-pipe limitation. The scoped fix
extracts the existing capture into `automation/lib/command.ts`; verification and
Git preflight both consume it. Windows uses temporary file descriptors and other
platforms retain pipes, with unchanged redaction, cleanup and result semantics.

The runner still executes `git rev-parse --show-toplevel`, canonicalizes its
single absolute directory result and requires equality with the runner root.
Invalid/non-root repositories, malformed output and process/capture errors fail
closed before SDK execution. Git is bounded to 30 seconds and 64 KiB per stream.
Dry-run may create and remove transient OS-temp captures, but no project state.
This does not change permissions, SDK transport/settings, dependencies, CI,
quality/repair guards, Product/UI or M10. Initial smoke and repeat 1 stay BLOCKED
as historical records; repeat 2 has a separate report.
