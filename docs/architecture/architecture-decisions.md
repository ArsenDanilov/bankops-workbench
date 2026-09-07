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
  `useReviewQueueSearchParams` hook preserves the public URL contract and supplies
  canonical server-affecting inputs to the query key and API request.
- TanStack Query owns Review Queue server state: response data/metadata, initial
  loading, retained data during background fetching, refresh, error and retry.
  Query keys use normalized primitive segments for all server-affecting inputs.
- Local React state owns transient UI only: toolbar/risk disclosures, actual
  truncation tooltips and temporary incorporated-row emphasis. URL and server
  state are not duplicated there.
- `ReviewQueueItem` is the typed Queue projection, not a full ReviewCase model.
  It separates lifecycle, ownership, SLA state and risk signals/score, with IDs,
  timestamps, amount/currency and display names needed by the Queue.
- Native `fetch` calls the typed `/api/review-cases` collection boundary and
  forwards TanStack Query's AbortSignal. Lightweight runtime parsing validates
  the response envelope and Queue projection fields; no schema library exists.
- MSW owns ten deterministic initial fixtures and one pending incoming fixture.
  Its handler applies the shared search/filter logic, operational ordering and
  pagination, and returns total/page/pageSize/updatedAt/pendingCount metadata.
  A short deterministic delay exposes real request states. The explicit incoming
  POST incorporates the one pending case; no polling or random events exist.
- No Redux/Zustand or other global client state store. Avoid premature shared
  abstractions, generic UI-kit components and speculative domain models.

## Async data boundary — M10

M10 implements TanStack Query, native fetch and MSW for Review Queue only. MSW
starts once at the application boundary in local development and once through
central Vitest lifecycle hooks in tests; feature components do not know the
transport is mocked. Production builds contain the API client but do not start a
mock worker. There is no Axios, backend, persistence, authentication, global
client store, polling, SSE or WebSocket. Workspace APIs remain future work.

## Testing and quality roadmap

- Existing checks: ESLint (`npm run lint`), TypeScript (`npm run typecheck`),
  Vitest (`npm run test`) and production build (`npm run build`); Prettier is
  installed. `test` runs once; `test:watch` is the optional local watch command.
- The previously human-approved Windows-safe Vite workaround uses its supported
  native config loader in `test` and the Vite part of `build`. It changes neither
  test coverage/pool nor build scope and avoids the restricted host's stdio-pipe
  `spawn EPERM`; no elevated Windows permission is required.
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
- M9 is human-accepted and present on the main development line. M10 implements
  the separately approved Queue async-data milestone. Review Case Workspace
  Visual Design remains the recommended next milestone after human acceptance;
  E2E/final quality remains later backlog work.
- Visible UI changes require browser self-review at the relevant specification's
  viewport, including console, keyboard, states and material fallbacks.
- Every milestone ends with factual verification and a standardized
  [report](../reports/README.md), followed by human review.
