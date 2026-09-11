# Review Case Workspace — Transaction History v1

Approved W4 source of truth. The human supplied the original W4 specification
and resolved the missing-dataset gate on 2026-09-09 with the exact remainder
below. This extends [Workspace v1](review-case-workspace.md); W1–W3 are accepted.

## Evidence and read boundary

`GET /api/review-cases/:caseId/transaction-history` is independent of details.
Use the same `sourceSnapshotId` as Customer Behavior: `EV-CUST-0314-20260907`.
RiskAssessment remains a separate immutable snapshot. History must not regenerate
risk evidence or frontend-author median, typical range, deviation or frequency.

The 90-day period ends at the current operation time, 2026-09-07 13:06:18 +03:00.
The response provides caseId, sourceSnapshotId, asOf, period, summary, the full
bounded amountSeries, a detailed items page and cursor/limit/total pageInfo.
Initial 10 newest rows; Load older appends 10 → 20 → 30 → 40 → 46, newest first.
No numbered pages, infinite scroll, client sorting or period controls.

## Authoritative canonical dataset

All timestamps below are in 2026, Europe/Moscow (+03:00). Exactly 46 historical
outgoing transfers; Completed, known recipients. The first ten recipients are
fixed. The remainder uses coherent known recipients without changing these
approved timestamps or amounts. No random data or failed/cancelled demo rows.

| Date/time | Amount RUB | Recipient (fixed recent ten) |
| --- | ---: | --- |
| 07 Sep 09:14 | 18500 | Ирина Виноградова |
| 05 Sep 18:32 | 46000 | Павел Никифоров |
| 04 Sep 12:11 | 27400 | Ирина Виноградова |
| 01 Sep 20:48 | 63000 | Дмитрий Ковалёв |
| 29 Aug 15:26 | 34900 | Екатерина Власова |
| 27 Aug 10:05 | 51000 | Павел Никифоров |
| 23 Aug 19:42 | 22700 | Ирина Виноградова |
| 20 Aug 08:57 | 79000 | Дмитрий Ковалёв |
| 16 Aug 13:37 | 41300 | Екатерина Власова |
| 11 Aug 17:18 | 58600 | Павел Никифоров |
| 08 Aug 14:20 | 43800 | |
| 06 Aug 21:43 | 15500 | |
| 05 Aug 05:07 | 64500 | |
| 03 Aug 12:31 | 28500 | |
| 01 Aug 19:54 | 90500 | |
| 31 Jul 03:18 | 34200 | |
| 29 Jul 10:42 | 52000 | |
| 27 Jul 18:06 | 19500 | |
| 26 Jul 01:29 | 74000 | |
| 24 Jul 08:53 | 38400 | |
| 22 Jul 16:17 | 45500 | |
| 20 Jul 23:40 | 24000 | |
| 19 Jul 07:04 | 60000 | |
| 17 Jul 14:28 | 32800 | |
| 15 Jul 21:52 | 86000 | |
| 14 Jul 05:15 | 21000 | |
| 12 Jul 12:39 | 49500 | |
| 10 Jul 20:03 | 35600 | |
| 09 Jul 03:26 | 68000 | |
| 07 Jul 10:50 | 12000 | |
| 05 Jul 18:14 | 54500 | |
| 04 Jul 01:38 | 43200 | |
| 02 Jul 09:01 | 30000 | |
| 30 Jun 16:25 | 82000 | |
| 28 Jun 23:49 | 37000 | |
| 27 Jun 07:12 | 47200 | |
| 25 Jun 14:36 | 18000 | |
| 23 Jun 22:00 | 57000 | |
| 22 Jun 05:24 | 26800 | |
| 20 Jun 12:47 | 44800 | |
| 18 Jun 20:11 | 94000 | |
| 17 Jun 03:35 | 31500 | |
| 15 Jun 10:58 | 42000 | |
| 13 Jun 18:22 | 25500 | |
| 12 Jun 01:46 | 71000 | |
| 10 Jun 09:10 | 16800 | |

Authoritative summary: median 42,600 RUB; typical range 18,000–86,000 RUB;
historical maximum 94,000 RUB. Current 286,000 RUB is excluded from all 46
events. Fixture tests may verify coherence; production UI only does presentation
math. Summary reference layers can be absent for valid limited-history results.

## Coordinated section and geometry

Stay inside the 1008px canvas, not beneath the 360px Decision Rail. Preserve all
W2/W3 first-fold sizes, with History beginning at y≈730 at 1440×900. Page scrolls;
no internal scrollbar. Solid evidence surface, no floating cards.

24px horizontal padding leaves 960px. Sequence: heading (48px), gap (16px),
90-Day Amount History (248px), gap (16px), current held reference (56px), gap
(8px), Historical Transfers table (40px header, 48px rows), footer (44px).
Small text-metric calibration inside these containers is permitted.

## Amount History

Local SVG, no chart dependency/framework. Approximate drawing area 884×144.
Continuous actual time positions, no jitter; major labels around 10 Jun, 01 Jul,
22 Jul, 12 Aug, 07 Sep. Neutral circles for historical events; violet diamond
for current. Linear monetary scale with compact ticks; canonical 0/25k/50k/75k/100k.
Derive a readable ceiling from historical maximum and authoritative typical upper;
do not hard-code a universal 100k. Moderate current ≤ approximately 1.25 times
the historical visual ceiling may expand it; extreme current keeps the historical
domain and uses an explicit upward/off-scale cue at its actual horizontal time.
Canonical label: Current 286k / Off scale / ×6.7 median. The top must not imply
286k numerically. Typical band is neutral steel; median is neutral dashed.

Accessible textual evidence includes event count/window, historical maximum,
typical range, median and current off-scale explanation. One normal chart Tab
entry; Left/Right explores chronologically, Enter/Space pins details, Escape
dismisses pinned details. Active event has meaningful announcement and visible
marker. Details expose date/time, amount, recipient, relationship and status.
Hover may be transient; click may pin. No hover-only evidence or focus trap.

## Current and historical rows

Current reference is outside historical tbody: 07 Sep 13:06, 286,000 RUB,
Михаил Андреевич Сафронов, New recipient, Held. Explicit Current held transfer
and Not part of historical activity; subtle violet surface, 2px left marker.
Bound recipient height without shrinking typography.

Semantic table/caption explains historical outgoing, 90 days, newest first and
current shown separately. Five columns: Date/time 148, Amount 128, Recipient 340,
Relationship 220, Status 124px (total 960). Date/time uses two lines. Amount is
right aligned, tabular and no-wrap. Recipient is one line with true-overflow-only
accessible disclosure using Queue philosophy. Relationship supports Known recipient
and First transfer; Status supports Completed/Failed/Cancelled with secondary
neutral text, no heavy badges. No Device/Location/Operation ID columns.

Footer: Showing 10 of 46 + native Load older transfers button. Retain rows while
pending; prevent duplicate requests. Final: All 46 historical transfers shown,
no Load older button. No table/chart cross-highlighting or shared-selection system.

## States and continuation

Independent loading preserves first fold: static 248px chart and table skeletons;
current reference can render from details. No full-page spinner or opacity.
Transport error: Couldn't load transaction history / Historical transaction data
could not be retrieved / Retry. Real local refetch, no fake axes/zero count.
Server descriptor required/unavailable: no History request, chart, rows, fake
count or Retry; show Required context / Transaction history unavailable / The
evidence snapshot reports required transaction history as unavailable for this
case. No client decision-readiness gate.

A valid four-event response renders four points/rows and no Load older action;
no client count-based reliability heuristic. Customer Behavior adds Review 90-day
transaction history, reusing W3 focus/scroll/acknowledgment behavior. Unusual amount
Risk navigation still targets Behavior. No recipient filtering, velocity section,
operation drill-down, Claim/Decision, W5, responsive work or Inter migration.
