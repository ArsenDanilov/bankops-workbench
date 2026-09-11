# W4 — Workspace Transaction History — Implementation Report

## Status

NEEDS_REVIEW. The human resolved the missing-dataset gate on 2026-09-09.
W1–W3 reports are unchanged. This milestone is not self-accepted.

## Implemented

- Synchronized the exact approved 46-event dataset into the linked
  [visual specification](../visual/review-case-workspace-transaction-history.md).
- Added separate typed History API/query, deterministic MSW cursor pages and
  AbortSignal forwarding.
- Added local SVG Amount History, accessible summary/composite interaction,
  current-held reference, semantic table and incremental Load older.
- Added independent loading, transport Retry, server-unavailable and valid
  limited-history states.
- Added Behavior → History navigation using W3 focus/scroll acknowledgment.
- No dependency, Claim/Decision workflow, global state or chart framework.

## Files changed

- History source: `model/transactionHistory.types.ts`,
  `api/transactionHistoryApi.ts`, `api/transactionHistoryQuery.ts`,
  `lib/amountHistoryPresentation.ts`, `lib/historyFormatters.ts`.
- UI: `components/AmountHistory.tsx`, `components/TransactionHistorySection.tsx`,
  `components/TransactionHistory.module.css`, `components/InvestigationCanvas.tsx`,
  `ReviewCaseWorkspacePage.module.css`.
- Mock: `mocks/data/transactionHistory.fixtures.ts`, `mocks/handlers.ts`.
- Tests: `api/transactionHistoryApi.test.ts`, `components/AmountHistory.test.tsx`,
  `TransactionHistory.test.tsx`.
- Current Visual/Architecture/task/backlog documentation and this report.

## History API contract

`GET /api/review-cases/:caseId/transaction-history?limit=10&cursor=…` returns
case/snapshot identity, asOf, fixed period, authoritative summary, complete
amountSeries, detailed items and pageInfo. Runtime validation checks fields,
identity, unique events, period membership, chronology and cursor-page alignment.
Details retains only its History descriptor.

## Query / Load older architecture

`useInfiniteQuery` owns ordered pages and cursor state because explicit Load older
requires retained rows and independent next-page pending/error behavior. Key:
`['review-cases', 'transaction-history', caseId, sourceSnapshotId, 10]`.
Progression is 10 → 20 → 30 → 40 → 46; no numbered/infinite pagination or
duplicated appended-page React state. Transport gets one bounded retry and real
manual Retry. Required/unavailable descriptors disable the request.

## Canonical evidence dataset

- 46 exact approved events; same Behavior sourceSnapshotId/asOf.
- Median 42,600 RUB; typical range 18,000–86,000 RUB; max 94,000 RUB.
- Current held 286,000 RUB is excluded.
- All canonical historical rows are Completed/known recipients; the fixed newest
  ten recipients are preserved.
- Production does not derive behavioral/risk facts from events.

## Amount History

Native Workspace-local SVG uses actual continuous timestamps and a derived linear
ceiling. Canonical output is 0–100k with 25k ticks. Current 286k preserves the
historical scale and renders as a violet diamond with upward, Off scale and ×6.7
text. Historical circles, typical band and dashed median stay neutral.

Visible text communicates count/window, max, range, median and current meaning.
One listbox Tab entry uses aria-activedescendant; Left/Right explores oldest to
newest, Enter/Space pins detail and Escape dismisses it. Hover/click are optional
mouse equivalents. There are no 46 normal Tab stops or table cross-highlighting.

## Current held reference / Historical table

The 56px current group is outside tbody and explicitly says Current held transfer
and Not part of historical activity. It shows the details-owned date, amount,
recipient, relationship and Held status.

The native table/caption has exactly Date/time, Amount, Recipient, Relationship
and Status at 148/128/340/220/124px; header 40px, rows 48px. Dates are two-line,
amounts right/tabular and recipients reuse true-overflow disclosure. No nested
scroll, extra columns, sorting or row expansion.

## Loading / Error / Unavailable / Limited states

- Initial local skeleton retains first fold and current reference.
- Transport error removes fake data and offers a real section Retry.
- Required/unavailable issues no request and has no chart/rows/fake count/Retry.
- Four-event success renders four points/rows and no Load older or reliability rule.

## Tests

PASS — 16 files / 92 tests, zero failures/skips; W4 adds 18 tests. Coverage:
dataset/aggregate/snapshot invariants, all cursors, AbortSignal, invalid responses,
dynamic scale/authoritative layers, keyboard detail, semantic table/current
separation, retained rows, loading/Retry/unavailable/limited and W3 navigation.
All 74 previous Workspace/Queue tests pass.

## Browser / accessibility review

PASS on `/review-cases/RC-260907-0314` at 1440×900. First-fold 248/216/72px and
History y=730 remain. Canvas/rail/gap are 1008/360/24px; History and chart block
are 960px and 248px. Current is 56px; columns/header/rows match above. Rail stayed
at top 72px while scrolling. Keyboard exploration, focus continuation and all
five Load older states reached 46 rows. No nested or horizontal overflow; Workspace
and Queue consoles were clean. Queue retained ten rows/seven columns.

Transport variants and reduced motion were integration-tested rather than exposed
through Product debug UI. No screen-reader speech session is claimed.

## Quality gate

- lint: PASS.
- typecheck: PASS.
- test: PASS — 16 files / 92 tests, 87.87s.
- build: PASS — 115 modules; CSS 41.60kB, JS 325.80kB.
- `git diff --check`: PASS; Windows line-ending notices only.
- No package/CI/Queue source/details fixture or W1–W3 report changes.

## Product / Architecture / Visual deviations

Product: None. Architecture: None. Visual: no major deviation; documented native
scrollbar-gutter calibration preserves specified geometry. Font remains unchanged.

## Known issues

Behavior says `7 / 7d`, while the exact approved History contains four events in
the seven days ending at the current operation. Both authoritative inputs are
preserved; human review must reconcile count or scope before claiming full
cross-context frequency coherence. MSW remains development/test-only.

## Recommended next step

Human W4 review. After acceptance, W5 — Claim Workflow; do not begin automatically.

Suggested commit: `feat(workspace): add transaction history evidence`.
