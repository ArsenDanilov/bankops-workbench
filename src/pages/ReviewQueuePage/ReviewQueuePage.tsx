import { useEffect, useRef, useState } from 'react';
import { useReviewQueueSearchParams } from './hooks/useReviewQueueSearchParams';
import { filterReviewQueueItems } from './lib/filterReviewQueueItems';
import { sortReviewQueueItemsByOperationalOrder } from './lib/sortReviewQueueItems';
import {
  incomingReviewQueueFixture,
  reviewQueueFixtures,
} from './model/reviewQueue.fixtures';
import { REVIEW_QUEUE_PAGE_SIZE } from './model/reviewQueueSearchParams.types';
import { QueuePagination } from './QueuePagination';
import { QueueToolbar } from './QueueToolbar';
import { ReviewQueueHeader } from './ReviewQueueHeader';
import styles from './ReviewQueuePage.module.css';
import { ReviewQueueTable } from './ReviewQueueTable';

export const ReviewQueuePage = () => {
  const [isIncomingCasePending, setIsIncomingCasePending] = useState(true);
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
  const incorporatedItems = isIncomingCasePending
    ? reviewQueueFixtures
    : sortReviewQueueItemsByOperationalOrder([
        ...reviewQueueFixtures,
        incomingReviewQueueFixture,
      ]);
  const filteredItems = filterReviewQueueItems(incorporatedItems, state);
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

  useEffect(
    () => () => {
      if (highlightTimerRef.current !== null) {
        clearTimeout(highlightTimerRef.current);
      }
    },
    [],
  );

  const incorporateIncomingCase = () => {
    if (!isIncomingCasePending) {
      return;
    }

    setIsIncomingCasePending(false);
    setHighlightedCaseId(incomingReviewQueueFixture.caseId);

    if (highlightTimerRef.current !== null) {
      clearTimeout(highlightTimerRef.current);
    }

    highlightTimerRef.current = setTimeout(() => {
      setHighlightedCaseId(null);
      highlightTimerRef.current = null;
    }, 1800);
  };

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
          hasPendingIncomingCase={isIncomingCasePending}
          onIncorporateIncomingCase={incorporateIncomingCase}
        />
        <div className={styles.toolbarSeparator} aria-hidden="true" />
        <ReviewQueueTable
          items={currentItems}
          highlightedCaseId={highlightedCaseId}
        />
        <QueuePagination
          currentPage={currentPage}
          totalItems={filteredItems.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};
