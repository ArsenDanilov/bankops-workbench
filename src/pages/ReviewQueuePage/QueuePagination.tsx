import styles from './ReviewQueuePage.module.css';

interface QueuePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const QueuePagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  disabled = false,
}: QueuePaginationProps) => {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const firstItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className={styles.pagination} aria-label="Review queue pagination">
      <p className={styles.pageRange}>
        {totalItems ? `${firstItem}–${lastItem} of ${totalItems}` : '0 of 0'}
      </p>

      <div className={styles.paginationControls}>
        <button
          className={styles.paginationButton}
          type="button"
          disabled={disabled || currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <button
          className={styles.paginationButton}
          type="button"
          disabled={disabled || currentPage === pageCount}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
};
