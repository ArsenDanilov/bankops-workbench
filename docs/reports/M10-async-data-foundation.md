# M10 — Implementation Report

## Status

NEEDS_REVIEW

M10 implementation and autonomous verification are complete. Human acceptance is
pending; M10 is not marked `ACCEPTED`.

## Goal

Replace the Review Queue's direct fixture data source with an asynchronous,
production-like frontend data boundary while preserving the accepted Queue
Product, Visual, URL and interaction behavior.

## Implemented

- Added an application-level TanStack Query provider and a dedicated QueryClient
  factory.
- Added a typed native-fetch client for the Review Queue collection and incoming
  case endpoints, including lightweight response validation and AbortSignal
  forwarding.
- Added an MSW browser worker and test server with centralized lifecycle setup.
- Moved the deterministic Queue fixtures behind the mock-server boundary.
- Moved search, filtering, operational ordering and pagination into shared
  server-side Queue processing used by the MSW handler.
- Connected the existing skeleton, background updating treatment, Refresh,
  response timestamp, error/Retry state, pagination and incoming-case flow to
  real asynchronous server state.
- Preserved URL ownership of search, filters and page, and local ownership of
  disclosures and temporary incorporated-row emphasis.

## Files changed

- `package.json`, `package-lock.json`: approved dependencies, MSW worker metadata
  and the previously approved native Vite config-loader workaround for restricted
  Windows subprocess startup.
- `public/mockServiceWorker.js`: generated MSW browser worker.
- `eslint.config.js`: excludes only the generated worker artifact from source lint.
- `src/main.tsx`: application provider setup and development-only MSW startup.
- `src/app/providers/AppProviders.tsx`, `src/app/providers/queryClient.ts`:
  TanStack Query infrastructure.
- `src/pages/ReviewQueuePage/api/`: typed contract, fetch client, deterministic
  query options/key, shared collection processing and contract tests.
- `src/mocks/`: browser/test MSW infrastructure, handlers, state and deterministic
  Queue fixtures.
- `src/pages/ReviewQueuePage/ReviewQueuePage.tsx` and supporting header, toolbar,
  pagination and table files: asynchronous rendering and interaction wiring.
- `src/pages/ReviewQueuePage/ReviewQueueAsync.test.tsx`: focused async UI coverage.
- Existing Queue tests and `src/test/setup.ts`: retained M9 behavior coverage,
  adapted to the provider and centralized MSW lifecycle.
- Product, Visual, Architecture and task/backlog documentation: implemented M10
  facts and status only.

## Dependencies added

- `@tanstack/react-query` 5.102.8: Review Queue server-state ownership, caching,
  cancellation and refetch lifecycle.
- `msw` 2.15.0: deterministic development and automated-test HTTP boundary.

No Axios, global client-state store, schema library or backend framework was
added. npm reported zero known vulnerabilities after installation.

## Data flow

```text
Review Queue URL state
        ↓
normalized request inputs
        ↓
stable TanStack Query key
        ↓
typed Review Queue API client
        ↓
native fetch + AbortSignal
        ↓
MSW Review Queue handler
        ↓
deterministic fixture dataset
        ↓
search → filters → dueAt/createdAt ordering → pagination
        ↓
typed response metadata and items
```

## API contract

`GET /api/review-cases` accepts a deterministic transport encoding for `q`,
repeated `scope`, `sla=breached`, repeated `risk`, `page` and `pageSize`. This is
separate from and does not change the accepted public Review Queue URL contract.

The typed response contains `items`, `total`, `page`, `pageSize`, `updatedAt` and
`pendingCount`. The mock API validates supported filters and pagination inputs,
clamps out-of-range pages and applies the accepted operational order:
`dueAt ASC → createdAt ASC`.

`POST /api/review-cases/incoming` explicitly incorporates the single pending mock
case and returns its case ID. It does not change URL state.

## TanStack Query architecture

- The query key contains normalized primitive segments for search, scope, SLA,
  risk filters, page and page size; it contains no unstable object or function.
- With no cached data, the existing geometry-matched Queue skeleton is rendered.
- Placeholder data keeps the last successful table usable while a changed query
  or background refetch is in flight.
- Refresh calls the real query refetch, disables duplicate activation while the
  request is running and replaces the displayed update time only after success.
- Initial failure renders a distinct Queue error row with a real Retry action;
  successful zero results retain the separate empty-state copy.
- Automatic retries are disabled so test and development failure behavior is
  deterministic. TanStack Query's signal is passed directly to native fetch.

## MSW architecture

- `src/mocks/data/reviewQueue.fixtures.ts` owns ten coherent initial cases and the
  existing deterministic incoming case behind the API boundary.
- The GET handler owns request validation, shared Queue processing and response
  metadata. A 90 ms deterministic development delay exposes real loading states;
  tests reset the same state with zero default latency.
- Tests use focused handler overrides for deterministic non-random HTTP failures
  and short inspectable delays. No Product developer-control panel was added.
- The pending case is excluded from GET responses until the explicit POST action;
  the subsequent invalidation/refetch inserts it in operational order while all
  active filters still apply.
- The worker starts only at the application boundary in development. The test
  server starts only in centralized test setup. Production does not start MSW.

## Migration from fixtures

The production Queue import of
`src/pages/ReviewQueuePage/model/reviewQueue.fixtures.ts` was removed, and that
file was deleted. The deterministic data now lives at
`src/mocks/data/reviewQueue.fixtures.ts` and is read only by mock-server state.
Pure filter/order tests and the table rendering test import the fixture through
the mock-data location; the production Review Queue imports only query/API types
and operations.

## Tests

The final full run passed **8 test files and 51 tests** with no failed or skipped
tests. All meaningful M9 tests remain. New coverage includes:

- deterministic transport serialization and typed success response;
- server search/filter semantics, operational ordering and pagination metadata;
- controlled HTTP failure and native-fetch cancellation;
- initial loading to success;
- distinct error and empty states with real Retry;
- manual Refresh and retained data during background fetching;
- updated response time and duplicate-refresh prevention;
- incoming-case incorporation through the mock API while preserving filters,
  ordering, URL state and temporary highlight behavior.

## Verification

Verification used Node 24.19.0.

- lint: `npm run lint` — PASS, exit 0.
- typecheck: `npm run typecheck` — PASS, exit 0.
- test: `npm run test` — PASS, exit 0; **8 files, 51 tests**.
- build: `npm run build` — PASS, exit 0; Vite 8.2.2 transformed 95 modules.
  Output was CSS 21.72 kB (4.60 kB gzip) and JS 288.67 kB (90.87 kB gzip).
- dependency audit: npm reported zero vulnerabilities after installation.
- diff review: no Workspace feature, Product redesign, Visual redesign, backend,
  CI workflow or unrelated application behavior was introduced.

The restricted Windows host initially rejected Vite's default config-loader
subprocess with `spawn EPERM`. The already human-approved project workaround now
adds Vite's supported `--configLoader native` option to the existing test and
build commands. This preserves their full scope and requires no administrator
rights, sandbox weakening or Windows policy change.

## Browser review

- route: `/review-queue` on the local Vite development server.
- viewport: 1440 × 900.
- console: no errors or warnings during the successful review session.
- initial loading: real busy skeleton observed before the delayed MSW response.
- successful render: ten ordered Queue cases and response-owned update time.
- search/filter: case search and Risk signal filtering changed API-backed results
  while preserving the accepted URL encoding and interaction behavior.
- Refresh: completed a real background refetch, kept existing rows visible and
  changed the deterministic update time.
- disclosures: Risk `+N` content still opened and dismissed with Escape.
- incoming case: remained pending until explicit activation, then appeared in
  operational order without rewriting URL state.
- empty state: a successful no-match search showed the distinct empty treatment.
- layout: table layout remained fixed; measured header was 40 px, rows 60 px and
  columns 144/224/128/180/180/flexible/72 px. No horizontal overflow appeared.

The controlled failure/Retry path was exercised by the MSW integration test, not
manually injected into the Product UI because M10 intentionally adds no developer
control panel. Network calls otherwise completed through the local MSW worker.

## Production behaviour changes

- Queue data now arrives asynchronously through the typed API/query boundary.
- Search, filters, operational ordering and pagination are processed by the mock
  server rather than the production component.
- Pagination range and availability now use response metadata.
- Refresh is a real background request and update time comes from its response.
- Request failure is distinct from an empty result and offers Retry.
- Incoming-case incorporation is an explicit mock API mutation followed by query
  invalidation and refetch.

Visual/Product changes: None.

## Accessibility review

Existing semantic table, labels, native controls, keyboard handling, disclosure
state, focus return, skeleton busy/hidden behavior and reduced-motion treatment
remain covered by the retained tests. The error Retry is a named native button,
and initial loading exposes the results region as busy without presenting
skeleton rows as data.

## Architecture deviations

None.

## Known issues

- MSW is a deterministic development/test backend, not persistence or a real
  production service. A production deployment still requires a compatible API.
- Runtime response checks are intentionally lightweight hand-written guards; M10
  does not add a schema-validation library.
- The controlled HTTP-error scenario is test-owned. There is intentionally no
  Product UI switch for forcing failures in development.
- Vitest retains isolation and prints its informational performance advisory.
- The local Windows host can reject Vite's subprocess-based config loader; the
  approved native loader is project-scoped and does not change security policy.
- The attempted Windows Node permission prompt was not approved and was not
  required. Review used loopback only; no firewall or administrator-level setting
  was changed.

## Recommended next step

Human acceptance of M10, followed by a separately approved
**Review Case Workspace — Visual Design** milestone. Do not begin it automatically.
