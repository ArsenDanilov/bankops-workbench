# BankOps — Architecture Decisions v1

## Implemented baseline

- Vite 8 + React 19.2 + TypeScript 5.9 with strict checking; npm and Node 24.x
  (`package.json` specifies `>=24 <25`).
- React Router v7 **Declarative Mode**: `BrowserRouter`, `Routes`, `Route`, and
  `Navigate`. `/` redirects to `/review-queue` with replace. AppShell owns the
  layout. Review Queue and the deep-linkable `/review-cases/:caseId` Workspace
  data-foundation route are implemented. No Data Router, framework-mode routing
  or Case History route.
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
- Workspace uses a separate grouped `ReviewCaseDetails` read projection. Its
  nested `ReviewCase` aggregate carries lifecycle/version/ownership references
  and a discriminated decision; OperationContext, immutable RiskAssessment,
  behavior, recipient, conditional device/location and Transaction History
  descriptor remain explicit context boundaries. Queue types are unchanged.
- Context requirement/availability is server data and is distinct from HTTP
  loading/failure. Decision readiness is a server-authored ready/blocked result;
  the frontend does not infer it from risk score or signal count.
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

## Async data boundaries — M10 and W1

M10 implements TanStack Query, native fetch and MSW for Review Queue. W1 extends
the same boundary with `GET /api/review-cases/:caseId`, the stable
`['review-cases', 'detail', caseId]` query key and a canonical detailed fixture.
404 remains distinct from transport failure; a bounded transient GET retry and
manual Retry are implemented, and AbortSignal reaches native fetch. MSW
starts once at the application boundary in local development and once through
central Vitest lifecycle hooks in tests; feature components do not know the
transport is mocked. Production builds contain the API clients but do not start
  a mock worker. There is no Axios, backend persistence, authentication, global
  client store, polling, SSE or WebSocket.

## Workspace presentation boundary — W2

W2 keeps the W1 route/query/API/MSW boundary and replaces only its intentionally
minimal success rendering. Workspace-local components compose Case Orientation,
one solid Investigation Canvas and a sticky complementary Decision Rail. The
canvas owns fixed first-fold section geometry; the rail is a 360px functional
foreground with an opaque fallback and supported blur enhancement. No generic
Card/panel system or second visual system exists.

The details projection now includes server-authored SLA orientation data and
explicit 24h/7d recent-activity counts required by the accepted first fold. Risk
evidence copy remains part of the immutable server snapshot. No History query,
Decision mutation, local readiness inference, UI navigation anchor or new state
library is introduced.

## Workspace evidence navigation — W3

W3 adds only Workspace-local presentation behavior. A pure helper maps
authoritative amount values onto a capped comparison lane; it does not calculate
backend risk analytics. One frontend mapping owns risk code → rendered evidence
destination and explicit link wording. `RiskSignal` domain/API objects remain
unchanged and contain no UI IDs.

Native anchors, `scroll-margin-top`, focusable destination wrappers and short
local acknowledgment state implement contextual navigation without a
router/global-state/scrolling dependency. Risk overflow is local non-modal
disclosure state: the first three signals remain in the fixed row and only the
fourth/fifth appear in the overlay. No History request or Decision mutation is
introduced.

## Workspace Transaction History — W4

History extends the W1 read boundary with
`GET /api/review-cases/:caseId/transaction-history?limit=10&cursor=…`.
`ReviewCaseDetails` still contains a descriptor only; no embedded History rows.
The separate typed response has caseId, sourceSnapshotId, asOf, fixed 90-day
period, authored summary references, the complete bounded amountSeries, the
current items page, and pageInfo (limit, decimal-offset cursor/nextCursor, total).
The compact event projection includes the recipient/relationship/status needed
for chart point details; no second operation-detail endpoint is introduced.

`useInfiniteQuery` is justified specifically by explicit Load older semantics:
TanStack owns the ordered pages and in-flight next-page state, retaining existing
rows on pending/error. Its key is
`['review-cases', 'transaction-history', caseId, sourceSnapshotId, 10]`;
cursor state lives in TanStack pageParams. There is no appended-pages React store,
infinite scroll or generic pagination framework. One bounded retry and local
Retry are real requests. AbortSignal reaches native fetch. Runtime validation
checks projection fields, chronology, page alignment and identity; the query
rejects a different sourceSnapshotId before presenting unrelated evidence.
Server-authoritative unavailable descriptors disable this query entirely.

MSW reuses the existing Workspace mock latency/lifecycle and serves the exact
46 approved timestamp/amount pairs. The held operation comes only from details
and is excluded from History. Optional median/range permit valid limited-history
responses without client reliability rules. Production code does not derive
median, typical range, deviation, frequency or risk from historical events.

Workspace-local SVG uses presentation-only ceiling/time-position helpers and one
listbox/aria-activedescendant entry for chronological keyboard exploration.
The current diamond is distinct from historical circles. Chart interaction is
local, not shared with the table. The existing Queue overflow-text component is
reused unchanged for recipient disclosure. The semantic table and current-held
reference remain separate DOM structures. No new dependency, mutation, chart
framework or global state system is introduced.

## Workspace Claim mutation — W5

W5 adds the pessimistic `POST /api/review-cases/:caseId/claim` mutation. The
browser sends only `expectedVersion`; current-analyst identity remains in the
server/session boundary modelled by MSW. Success returns the authoritative
Workspace projection with `in_review`, ownership, server timestamps and an
incremented version. Same-analyst retry returns that current projection.

The mutation writes the exact `['review-cases', 'detail', caseId]` cache and
invalidates the `['reviewQueue']` query family instead of patching filtered Queue
pages. A `409 claim_conflict` or `409 case_invalidated` may carry the authoritative
current projection; the client replaces stale details, invalidates Queue queries
and renders read-only/conflict state without an optimistic rollback. Deterministic
MSW-only scenarios are selected from the development page referrer; production
request shape and routing remain unchanged. No global store or new dependency is
introduced.

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
- M9, M10, W1 and W2 are human-accepted and present on the main development
  line. W3 implements the separately approved Workspace evidence grammar and
  risk navigation milestone; E2E/final quality remains later backlog work.
- Visible UI changes require browser self-review at the relevant specification's
  viewport, including console, keyboard, states and material fallbacks.
- Every milestone ends with factual verification and a standardized
  [report](../reports/README.md), followed by human review.
