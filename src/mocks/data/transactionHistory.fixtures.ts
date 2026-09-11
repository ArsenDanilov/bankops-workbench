import type {
  HistoricalTransfer,
  TransactionHistory,
} from '../../pages/ReviewCaseWorkspacePage/model/transactionHistory.types';
import { canonicalReviewCaseDetails } from './reviewCaseDetails.fixtures';

const recipients = [
  { id: 'recipient-irina', displayName: 'Ирина Виноградова' },
  { id: 'recipient-pavel', displayName: 'Павел Никифоров' },
  { id: 'recipient-dmitry', displayName: 'Дмитрий Ковалёв' },
  { id: 'recipient-ekaterina', displayName: 'Екатерина Власова' },
];

// Exact human-approved timestamp/amount pairs; see the linked visual specification.
const events: [string, number, number][] = [
  ['09-07T09:14', 18500, 0],
  ['09-05T18:32', 46000, 1],
  ['09-04T12:11', 27400, 0],
  ['09-01T20:48', 63000, 2],
  ['08-29T15:26', 34900, 3],
  ['08-27T10:05', 51000, 1],
  ['08-23T19:42', 22700, 0],
  ['08-20T08:57', 79000, 2],
  ['08-16T13:37', 41300, 3],
  ['08-11T17:18', 58600, 1],
  ['08-08T14:20', 43800, 1],
  ['08-06T21:43', 15500, 0],
  ['08-05T05:07', 64500, 2],
  ['08-03T12:31', 28500, 0],
  ['08-01T19:54', 90500, 2],
  ['07-31T03:18', 34200, 3],
  ['07-29T10:42', 52000, 1],
  ['07-27T18:06', 19500, 0],
  ['07-26T01:29', 74000, 2],
  ['07-24T08:53', 38400, 3],
  ['07-22T16:17', 45500, 1],
  ['07-20T23:40', 24000, 0],
  ['07-19T07:04', 60000, 2],
  ['07-17T14:28', 32800, 3],
  ['07-15T21:52', 86000, 2],
  ['07-14T05:15', 21000, 0],
  ['07-12T12:39', 49500, 1],
  ['07-10T20:03', 35600, 3],
  ['07-09T03:26', 68000, 2],
  ['07-07T10:50', 12000, 0],
  ['07-05T18:14', 54500, 1],
  ['07-04T01:38', 43200, 3],
  ['07-02T09:01', 30000, 0],
  ['06-30T16:25', 82000, 2],
  ['06-28T23:49', 37000, 3],
  ['06-27T07:12', 47200, 1],
  ['06-25T14:36', 18000, 0],
  ['06-23T22:00', 57000, 1],
  ['06-22T05:24', 26800, 0],
  ['06-20T12:47', 44800, 3],
  ['06-18T20:11', 94000, 2],
  ['06-17T03:35', 31500, 3],
  ['06-15T10:58', 42000, 1],
  ['06-13T18:22', 25500, 0],
  ['06-12T01:46', 71000, 2],
  ['06-10T09:10', 16800, 0],
];

const historicalTransfers: HistoricalTransfer[] = events.map(
  ([time, amount, recipient], index) => ({
    id: `HIST-0314-${String(index + 1).padStart(2, '0')}`,
    timestamp: `2026-${time}:00+03:00`,
    amount,
    recipient: recipients[recipient],
    relationship: 'known',
    status: 'completed',
  }),
);

const behavior = canonicalReviewCaseDetails.contexts.customerBehavior.data;
const operation = canonicalReviewCaseDetails.contexts.operation.data.operation;

export const canonicalTransactionHistory: TransactionHistory = {
  caseId: canonicalReviewCaseDetails.case.id,
  sourceSnapshotId: behavior.sourceSnapshotId,
  asOf: behavior.asOf,
  period: {
    days: 90,
    from: '2026-06-09T13:06:18+03:00',
    to: operation.initiatedAt,
  },
  summary: {
    currency: 'RUB',
    historicalMaximum: 94000,
    median: behavior.amounts.median90d,
    typicalRange: behavior.amounts.typicalRange,
  },
  amountSeries: historicalTransfers,
  items: historicalTransfers.slice(0, 10),
  pageInfo: { limit: 10, nextCursor: '10', total: 46 },
};

export const readTransactionHistoryPage = (
  limit: number,
  cursor?: string,
): TransactionHistory => {
  const offset = Number(cursor ?? 0);
  const next = offset + limit;
  return {
    ...canonicalTransactionHistory,
    items: historicalTransfers.slice(offset, next),
    pageInfo: {
      limit,
      cursor,
      nextCursor: next < historicalTransfers.length ? String(next) : undefined,
      total: historicalTransfers.length,
    },
  };
};
