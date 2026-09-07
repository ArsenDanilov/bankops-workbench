import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { fetchReviewQueue } from './reviewQueueApi';
import type { ReviewQueueRequest } from './reviewQueueApi.types';

export const reviewQueueQueryKey = (request: ReviewQueueRequest) =>
  [
    'reviewQueue',
    request.search.trim(),
    request.scopes.join(','),
    request.slaBreached ? 'breached' : 'all-sla',
    request.riskSignals.join(','),
    request.page,
    request.pageSize,
  ] as const;

export const reviewQueueQueryOptions = (request: ReviewQueueRequest) =>
  queryOptions({
    queryKey: reviewQueueQueryKey(request),
    queryFn: ({ signal }) => fetchReviewQueue(request, signal),
    placeholderData: keepPreviousData,
    retry: false,
  });
