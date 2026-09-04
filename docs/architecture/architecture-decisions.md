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
  production build (`npm run build`); Prettier is installed.
- No `test` script, automated test suite or CI configuration exists in this
  baseline. Do not report these as passing or introduce them in M-AUTO1.
- M9 — Quality Gate is the next planned major milestone; its precise tests,
  tooling and acceptance criteria require a separately approved task.
- M10 — Async Data Foundation follows. E2E/final quality remains later backlog
  work; no testing framework choice is implied by this document.
- Visible UI changes require browser self-review at the relevant specification's
  viewport, including console, keyboard, states and material fallbacks.
- Every milestone ends with factual verification and a standardized
  [report](../reports/README.md), followed by human review.
