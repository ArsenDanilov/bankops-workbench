import { delay, http, HttpResponse } from 'msw';
import {
  isSupportedRiskSignal,
  isSupportedScope,
} from '../pages/ReviewQueuePage/api/reviewQueueApi';
import { processReviewQueue } from '../pages/ReviewQueuePage/api/processReviewQueue';
import type { ReviewQueueRequest } from '../pages/ReviewQueuePage/api/reviewQueueApi.types';
import type { ReviewQueueRiskSignal } from '../pages/ReviewQueuePage/model/reviewQueue.types';
import type { ReviewQueueScope } from '../pages/ReviewQueuePage/model/reviewQueueSearchParams.types';
import {
  incorporateMockIncomingCase,
  readMockReviewQueue,
} from './reviewQueueState';
import { readMockReviewCaseDetails } from './reviewCaseDetailsState';
import { readTransactionHistoryPage } from './data/transactionHistory.fixtures';

const positiveInteger = (value: string | null) =>
  value !== null && /^[1-9]\d*$/.test(value) ? Number(value) : null;

export const reviewQueueHandlers = [
  http.get('/api/review-cases', async ({ request }) => {
    const url = new URL(request.url);
    const page = positiveInteger(url.searchParams.get('page'));
    const pageSize = positiveInteger(url.searchParams.get('pageSize'));
    const scopes = url.searchParams.getAll('scope');
    const risks = url.searchParams.getAll('risk');
    if (
      page === null ||
      pageSize === null ||
      pageSize > 100 ||
      scopes.some((scope) => !isSupportedScope(scope)) ||
      risks.some((risk) => !isSupportedRiskSignal(risk))
    )
      return HttpResponse.json(
        { message: 'Invalid queue query' },
        { status: 400 },
      );

    const mock = readMockReviewQueue();
    await delay(mock.latencyMs);
    const query: ReviewQueueRequest = {
      search: url.searchParams.get('q') ?? '',
      scopes: scopes as ReviewQueueScope[],
      slaBreached: url.searchParams.get('sla') === 'breached',
      riskSignals: risks as ReviewQueueRiskSignal[],
      page,
      pageSize,
    };
    return HttpResponse.json(
      processReviewQueue(mock.dataset, query, {
        updatedAt: mock.nextUpdatedAt(),
        pendingCount: mock.pendingCount,
      }),
    );
  }),
  http.post('/api/review-cases/incoming', async () => {
    const mock = readMockReviewQueue();
    await delay(mock.latencyMs);
    return HttpResponse.json({
      incorporatedCaseId: incorporateMockIncomingCase(),
    });
  }),
];

export const reviewCaseDetailsHandlers = [
  http.get(
    '/api/review-cases/:caseId/transaction-history',
    async ({ params, request }) => {
      const mock = readMockReviewCaseDetails();
      if (params.caseId !== mock.canonical.case.id)
        return HttpResponse.json(
          { message: 'Review case not found' },
          { status: 404 },
        );
      const url = new URL(request.url);
      const limit = positiveInteger(url.searchParams.get('limit'));
      const cursor = url.searchParams.get('cursor') ?? undefined;
      if (
        !limit ||
        limit > 100 ||
        (cursor !== undefined &&
          (!/^\d+$/.test(cursor) || Number(cursor) >= 46))
      )
        return HttpResponse.json(
          { message: 'Invalid history page' },
          { status: 400 },
        );
      await delay(mock.latencyMs);
      return HttpResponse.json(readTransactionHistoryPage(limit, cursor));
    },
  ),
  http.get('/api/review-cases/:caseId', async ({ params }) => {
    const caseId = String(params.caseId ?? '');
    const mock = readMockReviewCaseDetails();
    await delay(mock.latencyMs);
    if (caseId !== mock.canonical.case.id)
      return HttpResponse.json(
        { message: 'Review case not found' },
        { status: 404 },
      );
    return HttpResponse.json(mock.canonical);
  }),
];

export const handlers = [...reviewQueueHandlers, ...reviewCaseDetailsHandlers];
