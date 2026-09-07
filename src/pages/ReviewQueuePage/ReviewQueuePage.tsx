import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useReviewQueueSearchParams } from './hooks/useReviewQueueSearchParams';
import { incorporateIncomingReviewCase } from './api/reviewQueueApi';
import { reviewQueueQueryOptions } from './api/reviewQueueQuery';
import { REVIEW_QUEUE_PAGE_SIZE } from './model/reviewQueueSearchParams.types';
import { QueuePagination } from './QueuePagination';
import { QueueToolbar } from './QueueToolbar';
import { ReviewQueueHeader } from './ReviewQueueHeader';
import styles from './ReviewQueuePage.module.css';
import { ReviewQueueTable } from './ReviewQueueTable';

export const ReviewQueuePage = () => {
  const queryClient = useQueryClient();
  const [highlightedCaseId, setHighlightedCaseId] = useState<string | null>(
    null,
  );
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    state,
    pageParamNeedsNormalization,
    hasActiveQuery,
    setSearch,
    toggleScope,
    toggleSlaBreached,
    toggleRiskSignal,
    setPage,
    reset,
  } = useReviewQueueSearchParams();
  const request = { ...state, pageSize: REVIEW_QUEUE_PAGE_SIZE };
  const queue = useQuery(reviewQueueQueryOptions(request));
  const incorporation = useMutation({
    mutationFn: () => incorporateIncomingReviewCase(),
    onSuccess: async ({ incorporatedCaseId }) => {
      await queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      if (!incorporatedCaseId) return;
      setHighlightedCaseId(incorporatedCaseId);
      if (highlightTimerRef.current !== null)
        clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedCaseId(null);
        highlightTimerRef.current = null;
      }, 1800);
    },
  });
  const currentPage = queue.data?.page ?? state.page;

  useEffect(() => {
    if (pageParamNeedsNormalization) setPage(1, true);
    else if (queue.data && queue.data.page !== state.page)
      setPage(queue.data.page, true);
  }, [pageParamNeedsNormalization, queue.data, setPage, state.page]);

  useEffect(
    () => () => {
      if (highlightTimerRef.current !== null) {
        clearTimeout(highlightTimerRef.current);
      }
    },
    [],
  );

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <ReviewQueueHeader
          updatedAt={queue.data?.updatedAt}
          isUpdating={queue.isFetching && !queue.isPending}
          updateFailed={queue.isError && Boolean(queue.data)}
          onRefresh={() => void queue.refetch()}
        />
        <QueueToolbar
          state={state}
          hasActiveQuery={hasActiveQuery}
          onSearchChange={setSearch}
          onScopeToggle={toggleScope}
          onSlaBreachedToggle={toggleSlaBreached}
          onRiskSignalToggle={toggleRiskSignal}
          onReset={reset}
          hasPendingIncomingCase={(queue.data?.pendingCount ?? 0) > 0}
          isIncorporatingIncomingCase={incorporation.isPending}
          onIncorporateIncomingCase={() => incorporation.mutate()}
        />
        <div className={styles.toolbarSeparator} aria-hidden="true" />
        <ReviewQueueTable
          items={queue.data?.items ?? []}
          highlightedCaseId={highlightedCaseId}
          presentationState={queue.isPending ? 'loading' : 'ready'}
          error={queue.isError && !queue.data ? queue.error : null}
          onRetry={() => void queue.refetch()}
        />
        <QueuePagination
          currentPage={currentPage}
          totalItems={queue.data?.total ?? 0}
          pageSize={queue.data?.pageSize ?? REVIEW_QUEUE_PAGE_SIZE}
          onPageChange={setPage}
          disabled={queue.isPending}
        />
      </div>
    </div>
  );
};
