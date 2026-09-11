import { infiniteQueryOptions } from '@tanstack/react-query';
import { fetchTransactionHistory } from './transactionHistoryApi';

export const transactionHistoryQueryOptions = (
  caseId: string,
  sourceSnapshotId: string,
) =>
  infiniteQueryOptions({
    queryKey: [
      'review-cases',
      'transaction-history',
      caseId,
      sourceSnapshotId,
      10,
    ] as const,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam, signal }) => {
      const page = await fetchTransactionHistory(caseId, pageParam, signal);
      if (page.sourceSnapshotId !== sourceSnapshotId)
        throw new Error('Transaction history evidence snapshot mismatch');
      return page;
    },
    getNextPageParam: (page) => page.pageInfo.nextCursor,
    retry: 1,
    retryDelay: 100,
  });
