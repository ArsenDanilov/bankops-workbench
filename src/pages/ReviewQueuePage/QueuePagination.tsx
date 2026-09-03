import { REVIEW_QUEUE_PAGE_SIZE } from './model/reviewQueueSearchParams.types';
import styles from './ReviewQueuePage.module.css';

interface QueuePaginationProps {
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const QueuePagination = ({
  currentPage,
  totalItems,
  onPageChange,
}: QueuePaginationProps) => {
  const pageCount = Math.max(1, Math.ceil(totalItems / REVIEW_QUEUE_PAGE_SIZE));
  const firstItem = totalItems
    ? (currentPage - 1) * REVIEW_QUEUE_PAGE_SIZE + 1
    : 0;
  const lastItem = Math.min(currentPage * REVIEW_QUEUE_PAGE_SIZE, totalItems);

  return (
    <nav className={styles.pagination} aria-label="Review queue pagination">
      <p className={styles.pageRange}>
        {totalItems ? `${firstItem}–${lastItem} of ${totalItems}` : '0 of 0'}
      </p>

      <div className={styles.paginationControls}>
        <button
          className={styles.paginationButton}
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <button
          className={styles.paginationButton}
          type="button"
          disabled={currentPage === pageCount}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
};
