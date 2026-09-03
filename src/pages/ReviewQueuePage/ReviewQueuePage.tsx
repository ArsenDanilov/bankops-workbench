import { useEffect } from 'react';
import { useReviewQueueSearchParams } from './hooks/useReviewQueueSearchParams';
import { filterReviewQueueItems } from './lib/filterReviewQueueItems';
import { reviewQueueFixtures } from './model/reviewQueue.fixtures';
import { REVIEW_QUEUE_PAGE_SIZE } from './model/reviewQueueSearchParams.types';
import { QueuePagination } from './QueuePagination';
import { QueueToolbar } from './QueueToolbar';
import { ReviewQueueHeader } from './ReviewQueueHeader';
import styles from './ReviewQueuePage.module.css';
import { ReviewQueueTable } from './ReviewQueueTable';

export const ReviewQueuePage = () => {
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
  const filteredItems = filterReviewQueueItems(reviewQueueFixtures, state);
  const pageCount = Math.max(
    1,
    Math.ceil(filteredItems.length / REVIEW_QUEUE_PAGE_SIZE),
  );
  const currentPage = Math.min(state.page, pageCount);
  const pageStart = (currentPage - 1) * REVIEW_QUEUE_PAGE_SIZE;
  const currentItems = filteredItems.slice(
    pageStart,
    pageStart + REVIEW_QUEUE_PAGE_SIZE,
  );

  useEffect(() => {
    if (pageParamNeedsNormalization || currentPage !== state.page) {
      setPage(currentPage, true);
    }
  }, [currentPage, pageParamNeedsNormalization, setPage, state.page]);

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <ReviewQueueHeader />
        <QueueToolbar
          state={state}
          hasActiveQuery={hasActiveQuery}
          onSearchChange={setSearch}
          onScopeToggle={toggleScope}
          onSlaBreachedToggle={toggleSlaBreached}
          onRiskSignalToggle={toggleRiskSignal}
          onReset={reset}
        />
        <div className={styles.toolbarSeparator} aria-hidden="true" />
        <ReviewQueueTable items={currentItems} />
        <QueuePagination
          currentPage={currentPage}
          totalItems={filteredItems.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};
