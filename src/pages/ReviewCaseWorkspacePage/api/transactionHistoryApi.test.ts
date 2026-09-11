import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { canonicalReviewCaseDetails as details } from '../../../mocks/data/reviewCaseDetails.fixtures';
import { canonicalTransactionHistory as fixture } from '../../../mocks/data/transactionHistory.fixtures';
import { server } from '../../../mocks/server';
import { fetchTransactionHistory } from './transactionHistoryApi';
import { transactionHistoryQueryOptions } from './transactionHistoryQuery';
import { createAppQueryClient } from '../../../app/providers/queryClient';

const endpoint = '/api/review-cases/:caseId/transaction-history';
describe('Transaction History read boundary', () => {
  it('returns the exact coherent 46-event snapshot and excludes the current held operation', async () => {
    const history = await fetchTransactionHistory(details.case.id);
    expect(history.sourceSnapshotId).toBe(
      details.contexts.customerBehavior.data.sourceSnapshotId,
    );
    expect(history.asOf).toBe(details.contexts.customerBehavior.data.asOf);
    expect(history.pageInfo.total).toBe(46);
    expect(history.amountSeries).toHaveLength(46);
    expect(history.items).toHaveLength(10);
    const sorted = history.amountSeries
      .map((e) => e.amount)
      .sort((a, b) => a - b);
    expect((sorted[22] + sorted[23]) / 2).toBe(42600);
    expect(history.summary.median).toBe(42600);
    expect(history.summary.typicalRange).toEqual({
      minimum: 18000,
      maximum: 86000,
    });
    expect(Math.max(...sorted)).toBe(94000);
    expect(
      history.amountSeries.some(
        (e) => e.id === details.case.operationId || e.amount === 286000,
      ),
    ).toBe(false);
    expect(
      history.amountSeries.every(
        (e) => e.status === 'completed' && e.relationship === 'known',
      ),
    ).toBe(true);
    expect(
      Date.parse(history.period.to) - Date.parse(history.period.from),
    ).toBe(90 * 86400000);
    expect(history.items[0]).toMatchObject({
      timestamp: '2026-09-07T09:14:00+03:00',
      amount: 18500,
      recipient: { displayName: 'Ирина Виноградова' },
    });
    expect(history.amountSeries.at(-1)).toMatchObject({
      timestamp: '2026-06-10T09:10:00+03:00',
      amount: 16800,
    });
  });

  it('follows every cursor without losing chronology or changing the complete chart series', async () => {
    let cursor: string | undefined;
    const ids: string[] = [];
    for (const count of [10, 10, 10, 10, 6]) {
      const page = await fetchTransactionHistory(details.case.id, cursor);
      expect(page.items).toHaveLength(count);
      expect(page.amountSeries).toEqual(fixture.amountSeries);
      ids.push(...page.items.map((e) => e.id));
      cursor = page.pageInfo.nextCursor;
    }
    expect(cursor).toBeUndefined();
    expect(ids).toEqual(fixture.amountSeries.map((e) => e.id));
    expect(new Set(ids).size).toBe(46);
  });

  it('forwards the actual AbortSignal and rejects cancellation', async () => {
    const controller = new AbortController();
    const pending = fetchTransactionHistory(
      details.case.id,
      undefined,
      controller.signal,
    );
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects deterministic transport failures and invalid cursors', async () => {
    await expect(
      fetchTransactionHistory(details.case.id, 'invalid'),
    ).rejects.toThrow('(400)');
    await expect(fetchTransactionHistory('UNKNOWN')).rejects.toThrow('(404)');
    server.use(
      http.get(endpoint, () => HttpResponse.json({}, { status: 503 })),
    );
    await expect(fetchTransactionHistory(details.case.id)).rejects.toThrow(
      '(503)',
    );
  });

  it('validates malformed and inconsistent page data', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          ...fixture,
          items: [{ ...fixture.items[0], amount: -1 }],
        }),
      ),
    );
    await expect(fetchTransactionHistory(details.case.id)).rejects.toThrow(
      'invalid response',
    );
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          ...fixture,
          amountSeries: [...fixture.amountSeries].reverse(),
        }),
      ),
    );
    await expect(fetchTransactionHistory(details.case.id)).rejects.toThrow(
      'invalid response',
    );
  });

  it('isolates History cache and refuses an unrelated evidence snapshot', async () => {
    const client = createAppQueryClient();
    const options = transactionHistoryQueryOptions(
      details.case.id,
      fixture.sourceSnapshotId,
    );
    expect(options.queryKey).not.toContain('detail');
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          ...fixture,
          sourceSnapshotId: 'different-snapshot',
        }),
      ),
    );
    await expect(
      client.fetchInfiniteQuery({ ...options, retry: false }),
    ).rejects.toThrow('snapshot mismatch');
    client.clear();
  });

  it('rejects a repeated cursor or a page that repeats already-shown rows', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          ...fixture,
          pageInfo: { ...fixture.pageInfo, nextCursor: '0' },
        }),
      ),
    );
    await expect(fetchTransactionHistory(details.case.id)).rejects.toThrow(
      'invalid response',
    );
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          ...fixture,
          pageInfo: { ...fixture.pageInfo, cursor: '10', nextCursor: '20' },
        }),
      ),
    );
    await expect(
      fetchTransactionHistory(details.case.id, '10'),
    ).rejects.toThrow('invalid response');
  });
});
