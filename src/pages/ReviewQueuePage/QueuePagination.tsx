import styles from './ReviewQueuePage.module.css';

export const QueuePagination = () => {
  return (
    <nav className={styles.pagination} aria-label="Review queue pagination">
      <p className={styles.pageRange}>1–25 of 86</p>

      <div className={styles.paginationControls}>
        <button className={styles.paginationButton} type="button">
          Previous
        </button>
        <button className={styles.paginationButton} type="button">
          Next
        </button>
      </div>
    </nav>
  );
};
