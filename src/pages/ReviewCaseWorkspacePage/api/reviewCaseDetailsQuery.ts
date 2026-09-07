import { queryOptions } from '@tanstack/react-query';
import {
  fetchReviewCaseDetails,
  isReviewCaseNotFoundError,
} from './reviewCaseDetailsApi';

export const reviewCaseDetailsQueryKey = (caseId: string) =>
  ['review-cases', 'detail', caseId] as const;

export const reviewCaseDetailsQueryOptions = (caseId: string) =>
  queryOptions({
    queryKey: reviewCaseDetailsQueryKey(caseId),
    queryFn: ({ signal }) => fetchReviewCaseDetails(caseId, signal),
    retry: (failureCount, error) =>
      !isReviewCaseNotFoundError(error) && failureCount < 1,
    retryDelay: 100,
  });
