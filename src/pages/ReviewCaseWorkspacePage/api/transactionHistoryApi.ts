import type {
  HistoricalTransfer,
  TransactionHistory,
} from '../model/transactionHistory.types';

const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;
const text = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const amount = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;
const date = (v: unknown): v is string =>
  text(v) && Number.isFinite(Date.parse(v));
const integer = (v: unknown): v is number =>
  amount(v) && Number.isSafeInteger(v);
const transfer = (v: unknown): v is HistoricalTransfer =>
  object(v) &&
  text(v.id) &&
  date(v.timestamp) &&
  amount(v.amount) &&
  object(v.recipient) &&
  text(v.recipient.id) &&
  text(v.recipient.displayName) &&
  ['known', 'first_transfer'].includes(String(v.relationship)) &&
  ['completed', 'failed', 'cancelled'].includes(String(v.status));

const parseHistory = (value: unknown): TransactionHistory => {
  const invalid = () =>
    new Error('Transaction history API returned an invalid response');
  if (
    !object(value) ||
    !text(value.caseId) ||
    !text(value.sourceSnapshotId) ||
    !date(value.asOf) ||
    !object(value.period) ||
    value.period.days !== 90 ||
    !date(value.period.from) ||
    !date(value.period.to) ||
    Date.parse(value.period.from) >= Date.parse(value.period.to) ||
    !object(value.summary) ||
    !['RUB', 'EUR', 'USD'].includes(String(value.summary.currency)) ||
    !amount(value.summary.historicalMaximum) ||
    (value.summary.median !== undefined && !amount(value.summary.median)) ||
    !Array.isArray(value.amountSeries) ||
    !value.amountSeries.every(transfer) ||
    !Array.isArray(value.items) ||
    !value.items.every(transfer) ||
    !object(value.pageInfo) ||
    !integer(value.pageInfo.total) ||
    !integer(value.pageInfo.limit) ||
    value.pageInfo.limit < 1 ||
    value.pageInfo.limit > 100 ||
    (value.pageInfo.cursor !== undefined && !text(value.pageInfo.cursor)) ||
    (value.pageInfo.nextCursor !== undefined &&
      !text(value.pageInfo.nextCursor))
  )
    throw invalid();
  const range = value.summary.typicalRange;
  if (
    range !== undefined &&
    (!object(range) ||
      !amount(range.minimum) ||
      !amount(range.maximum) ||
      range.minimum > range.maximum)
  )
    throw invalid();
  const history = value as unknown as TransactionHistory;
  const series = history.amountSeries;
  const offset = Number(history.pageInfo.cursor ?? 0);
  const next = offset + history.items.length;
  // W4's cursor is a decimal offset into this immutable, newest-first series.
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    offset > series.length ||
    history.items.length !==
      Math.min(history.pageInfo.limit, series.length - offset) ||
    history.pageInfo.nextCursor !==
      (next < series.length ? String(next) : undefined)
  )
    throw invalid();
  if (
    series.length !== history.pageInfo.total ||
    new Set(series.map((e) => e.id)).size !== series.length ||
    history.items.length > history.pageInfo.limit ||
    series.some(
      (event, index) =>
        Date.parse(event.timestamp) < Date.parse(history.period.from) ||
        Date.parse(event.timestamp) >= Date.parse(history.period.to) ||
        (index > 0 &&
          Date.parse(series[index - 1].timestamp) <
            Date.parse(event.timestamp)),
    ) ||
    history.items.some((item, index) => {
      const event = series[offset + index];
      return (
        !event ||
        event.id !== item.id ||
        event.timestamp !== item.timestamp ||
        event.amount !== item.amount ||
        event.recipient.id !== item.recipient.id ||
        event.recipient.displayName !== item.recipient.displayName ||
        event.relationship !== item.relationship ||
        event.status !== item.status
      );
    })
  )
    throw invalid();
  return history;
};

export const fetchTransactionHistory = async (
  caseId: string,
  cursor?: string,
  signal?: AbortSignal,
) => {
  const url = new URL(
    `/api/review-cases/${encodeURIComponent(caseId)}/transaction-history`,
    window.location.origin,
  );
  url.searchParams.set('limit', '10');
  if (cursor !== undefined) url.searchParams.set('cursor', cursor);
  const response = await fetch(url, { signal });
  if (!response.ok)
    throw new Error(`Transaction history request failed (${response.status})`);
  const history = parseHistory(await response.json());
  if (history.caseId !== caseId || history.pageInfo.cursor !== cursor)
    throw new Error('Transaction history page identity mismatch');
  return history;
};
