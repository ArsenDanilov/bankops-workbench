# W1 — Implementation Report

## Status

ACCEPTED

W1 implementation and autonomous verification are complete. Human acceptance
was confirmed in the approved W3 assignment.

## Goal

Introduce the deep-linkable Review Case Workspace route and its asynchronous
detailed-read foundation without implementing the final Workspace visual layout,
Transaction History query or case mutations.

## Implemented

- Added `/review-cases/:caseId` under the existing AppShell.
- Added separate grouped `ReviewCase` domain state and `ReviewCaseDetails`
  Workspace read projection without changing `ReviewQueueItem`.
- Added a typed native-fetch client for `GET /api/review-cases/:caseId`, explicit
  non-2xx errors, lightweight runtime validation and AbortSignal forwarding.
- Added a stable TanStack Query detail key, one bounded retry for non-404 GET
  failures and a real manual Retry action.
- Added a deterministic MSW canonical details fixture, 404 behavior and shared
  browser/test handler lifecycle.
- Added restrained semantic loading, success, not-found and generic error states
  that prove the route/query/data flow without becoming the W2 layout.
- Added focused API/model/query/React tests while retaining all Queue tests.

## Files changed

- `src/app/router/AppRouter.tsx`: deep-linkable Workspace route.
- `src/pages/ReviewCaseWorkspacePage/model/reviewCase.types.ts`: detailed domain,
  evidence, availability and readiness contracts.
- `src/pages/ReviewCaseWorkspacePage/api/reviewCaseDetailsApi.ts`: typed fetch
  boundary and runtime response validation.
- `src/pages/ReviewCaseWorkspacePage/api/reviewCaseDetailsQuery.ts`: stable query
  key and detail query policy.
- `src/pages/ReviewCaseWorkspacePage/ReviewCaseWorkspacePage.tsx` and CSS Module:
  minimal semantic W1 states.
- `src/mocks/data/reviewCaseDetails.fixtures.ts`: canonical case.
- `src/mocks/reviewCaseDetailsState.ts`, `src/mocks/handlers.ts`: deterministic
  details mock state and endpoint.
- `src/test/setup.ts`: centralized details-state reset.
- `src/pages/ReviewCaseWorkspacePage/api/reviewCaseDetailsApi.test.ts` and
  `ReviewCaseWorkspacePage.test.tsx`: W1 API and route integration coverage.
- Architecture, Product and active task/backlog documentation: implemented W1
  facts and milestone status.

## Dependencies added

None.

W1 reuses the accepted React Router, TanStack Query, native fetch, MSW, Vitest and
React Testing Library stack. No package or package-script change was made.

## Data model

### ReviewCase

`ReviewCase` is the stateful domain aggregate. It carries case ID, lifecycle,
positive optimistic-concurrency version, operation ID, assignment/timestamps and
an optional terminal state. Its lifecycle is discriminated: a resolved case must
have `resolvedAt` and a nested `ReviewDecision`; an invalidated case must have
`invalidatedAt`; active cases cannot carry terminal fields.

`ReviewDecision` is itself discriminated. Release supports an optional comment;
block requires a non-empty rationale. The API guard rejects a resolved block
shape without rationale.

### ReviewCaseDetails

`ReviewCaseDetails` is the Workspace read projection, not the aggregate and not a
Queue item. It groups case state, viewer-relative ownership, investigation
contexts and server decision readiness. No normalized entity store or giant flat
DTO was introduced.

### Operation and OperationContext

Core `Operation` state contains ID, amount/currency, initiation time and status.
`OperationContext` composes it with Workspace presentation evidence: customer,
masked source account, recipient, masked recipient account and optional purpose.
No redundant outgoing-transfer type discriminator was added.

### RiskAssessment

`RiskAssessment` is an immutable snapshot with ID, score, assessment time and a
non-empty signal list. Each signal holds only an approved risk code and captured
evidence snapshot. No frontend anchor or `linkedContext` navigation target exists
in the domain/API shape.

### Context availability

Always-required contexts use a discriminated required/available or
required/unavailable shape. Conditional Device/Location also support the distinct
not-relevant/not-applicable state. HTTP loading/failure remains TanStack Query
state and is never encoded as server context availability.

Transaction History is represented only by required availability plus
`sourceSnapshotId`/`asOf`; rows are not embedded. Behavior and the future History
query share the canonical evidence source ID.

### Decision readiness

Readiness is a server-authored `ready` or `blocked` union with a small blocker
vocabulary. The W1 UI consumes but does not infer readiness from score, signals
or visual state.

## API

`GET /api/review-cases/:caseId` returns a validated `ReviewCaseDetails` projection
for the canonical case. Unknown IDs return 404. Infrastructure 500/503 responses
remain request failures rather than unavailable individual contexts.

The client uses native fetch, percent-encodes the route parameter, forwards the
query AbortSignal, rejects every non-2xx response with a typed status-bearing
error and applies lightweight guards to nested response data. No Claim, Decision
or Transaction History endpoint was implemented.

## Query architecture

The stable detail key is:

```text
['review-cases', 'detail', caseId]
```

Each case ID has separate cached server state. TanStack Query owns initial
loading, success, transport error, manual Retry and cancellation. A 404 is never
retried or treated as an empty case. Other GET failures receive one bounded retry
with a short delay; the visible Retry performs a real refetch. Consuming the
provided AbortSignal lets TanStack Query cancel an inactive request.

## MSW canonical case

`RC-260907-0314` is an `in_review`, current-analyst case at version 3. Its held
operation is 286 000 RUB, initiated at 2026-09-07 13:06:18 +03:00, from
Александра Виноградова / •••• 4382 to Михаил Андреевич Сафронов / •••• 9127,
with purpose `Возврат долга`.

The immutable assessment has score 78 and exactly `unusual_amount`,
`new_recipient`, `device_change`. Behavior contains the authoritative 90-day
42 600 RUB median, 18 000–86 000 RUB range, ×6.7 deviation, 46-transfer history
and usual 3–5/week frequency. The recipient is new with zero successful prior
transfers. Device is required and available (Windows 11 / Chrome, first seen
today, recent iPhone/mobile pattern); Location is not relevant. Transaction
History is required/available as a descriptor only, and readiness is `ready`.

The handler uses a deterministic 90 ms development delay and zero default test
delay. Tests use scoped handler overrides for deterministic 503 behavior; no
Product developer-control surface was added.

## Tests

The final full run passed **10 test files and 62 tests** with no failures or
skips. W1 adds 2 files and 11 tests covering:

- canonical success and grouped evidence/readiness fields;
- version and domain invariants, including mandatory block rationale;
- absence of signal navigation anchors and embedded History rows;
- stable case-specific query key;
- typed 404 and deterministic 503 behavior;
- AbortSignal cancellation at the fetch contract;
- direct route loading and minimal successful rendering;
- real initial loading state;
- distinct not-found state with no 404 retry;
- bounded transient retry plus manual Retry refetch;
- navigation to another case ID and separate query/data selection.

All pre-existing Review Queue tests remain green.

## Browser review

- route: `/review-cases/RC-260907-0314` and `/review-cases/RC-UNKNOWN` on the
  local Vite server.
- viewport: 1440 × 900.
- success: canonical case ID, lifecycle, current ownership, amount and Risk
  Assessment summary rendered correctly.
- deep link: direct reload completed independently of Queue navigation.
- loading: the page exposed `aria-busy=true` before the delayed MSW response.
- not found: unknown ID rendered the distinct 404 state without Retry.
- Queue regression: `/review-queue` still rendered ten cases and its native table.
- console: no errors or warnings in the final success/404/Queue review.
- layout: one main landmark and no horizontal overflow on Workspace or Queue.

The controlled infrastructure-error/Retry path was exercised in the integration
test rather than exposed through a temporary Product UI control. The first reused
development-browser load briefly held a stale pre-HMR request state; fresh direct
reloads after the final module update passed consistently.

## Quality gate

Verification used Node 24.19.0.

- `npm run lint` — PASS, exit 0.
- `npm run typecheck` — PASS, exit 0.
- `npm run test` — PASS, exit 0; **10 files, 62 tests**.
- `npm run build` — PASS, exit 0; Vite 8.2.2 transformed 100 modules. Output:
  CSS 23.78 kB (4.92 kB gzip), JS 296.54 kB (93.03 kB gzip).
- `git diff --check` — PASS; line-ending normalization notices only.
- final scope review — no package, CI workflow, Queue logic/type, global store,
  mutation, History feature or unrelated application change.

The existing project-scoped native Vite config loader kept all commands usable on
the restricted corporate Windows host. No administrator permission, firewall
change or security-policy relaxation was requested or used.

## Accessibility review

The route retains the single AppShell main landmark, one state-specific h1,
ordered headings, semantic definition list/sections, named native Retry button,
visible Back link, `aria-busy` loading state and global focus/reduced-motion
treatment. Not-found and infrastructure failure use different text and actions.

## Product/Visual changes

None.

The minimal W1 surface implements only the approved route/data-state proof. It is
not presented or documented as the accepted W2 Workspace geometry.

## Architecture deviations

None.

## Known issues

- The endpoint is provided by MSW only in development/tests; no real backend or
  persistence exists.
- Runtime parsing uses deliberate hand-written guards rather than a schema
  library. Cross-field business coherence is fixture/test protected, not a full
  validation engine.
- Transaction History rows and request are intentionally deferred to W4.
- The repository contains no separate Workspace visual-specification file. W1
  therefore follows the approved prompt's intentionally minimal semantic state
  contract and does not claim final visual compliance.
- Generic infrastructure-error UI was automated-test reviewed, not manually
  forced in the browser because no developer failure switch was added.
- Vitest remains isolated and is comparatively slow on the restricted Windows
  host; all assertions completed successfully.

## Recommended next step

Human acceptance of W1, followed by a separately approved
**W2 — Workspace Structural Layout + First-Fold Evidence** milestone. Do not begin
W2 automatically.
