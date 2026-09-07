// @vitest-environment jsdom
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../../mocks/server';
import type { ReviewQueueRequest } from './reviewQueueApi.types';
import {
  createReviewQueueApiSearchParams,
  fetchReviewQueue,
} from './reviewQueueApi';

const request = (
  overrides: Partial<ReviewQueueRequest> = {},
): ReviewQueueRequest => ({
  search: '',
  scopes: [],
  slaBreached: false,
  riskSignals: [],
  page: 1,
  pageSize: 25,
  ...overrides,
});

describe('Review Queue API client and MSW backend', () => {
  it('serializes a deterministic transport without changing the public URL', () => {
    expect(
      createReviewQueueApiSearchParams(
        request({
          search: ' Елена ',
          scopes: ['queued', 'my_reviews'],
          slaBreached: true,
          riskSignals: ['new_recipient', 'high_velocity'],
          page: 2,
        }),
      ).toString(),
    ).toBe(
      'q=+%D0%95%D0%BB%D0%B5%D0%BD%D0%B0+&scope=queued&scope=my_reviews&sla=breached&risk=new_recipient&risk=high_velocity&page=2&pageSize=25',
    );
  });

  it('returns the typed collection, operational order and response metadata', async () => {
    const response = await fetchReviewQueue(request());
    expect(response).toMatchObject({
      total: 10,
      page: 1,
      pageSize: 25,
      updatedAt: '2026-09-02T10:24:00.000Z',
      pendingCount: 1,
    });
    expect(response.items.map((item) => item.caseId)).toEqual([
      'RC-260902-0184',
      'RC-260902-0189',
      'RC-260902-0196',
      'RC-260902-0201',
      'RC-260902-0207',
      'RC-260902-0212',
      'RC-260902-0219',
      'RC-260902-0225',
      'RC-260902-0231',
      'RC-260902-0237',
    ]);
  });

  it('applies search, scope, SLA and risk semantics on the server', async () => {
    const response = await fetchReviewQueue(
      request({
        search: 'ЕЛЕНА',
        scopes: ['queued'],
        slaBreached: true,
        riskSignals: ['unusual_amount'],
      }),
    );
    expect(response.total).toBe(1);
    expect(response.items[0]?.caseId).toBe('RC-260902-0184');
  });

  it('returns server-owned pagination metadata and clamps out-of-range pages', async () => {
    const second = await fetchReviewQueue(request({ page: 2, pageSize: 3 }));
    expect(second).toMatchObject({ total: 10, page: 2, pageSize: 3 });
    expect(second.items.map((item) => item.caseId)).toEqual([
      'RC-260902-0201',
      'RC-260902-0207',
      'RC-260902-0212',
    ]);
    const clamped = await fetchReviewQueue(request({ page: 999, pageSize: 3 }));
    expect(clamped.page).toBe(4);
    expect(clamped.items).toHaveLength(1);
  });

  it('surfaces a deterministic HTTP failure', async () => {
    server.use(
      http.get('/api/review-cases', () =>
        HttpResponse.json({ message: 'fixture failure' }, { status: 503 }),
      ),
    );
    await expect(fetchReviewQueue(request())).rejects.toThrow('(503)');
  });

  it('forwards cancellation to native fetch', async () => {
    server.use(
      http.get('/api/review-cases', async () => {
        await delay(100);
        return HttpResponse.json({});
      }),
    );
    const controller = new AbortController();
    const response = fetchReviewQueue(request(), controller.signal);
    controller.abort();
    await expect(response).rejects.toMatchObject({ name: 'AbortError' });
  });
});
