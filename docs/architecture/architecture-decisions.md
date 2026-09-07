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
- M9 implementation requires human acceptance. M-AUTO2 — Codex SDK Orchestrator
  is the recommended separately approved follow-up, not part of this application
  architecture or an installed capability. M10 remains the async-data milestone.
  E2E/final quality remains later backlog work.
- Visible UI changes require browser self-review at the relevant specification's
  viewport, including console, keyboard, states and material fallbacks.
- Every milestone ends with factual verification and a standardized
  [report](../reports/README.md), followed by human review.
