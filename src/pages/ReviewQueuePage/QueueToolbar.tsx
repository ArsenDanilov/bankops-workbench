import styles from './ReviewQueuePage.module.css';

export const QueueToolbar = () => {
  return (
    <section className={styles.toolbar} aria-label="Review queue controls">
      <div className={styles.searchField}>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20">
          <path d="M8.7 3.3a5.4 5.4 0 1 0 0 10.8 5.3 5.3 0 0 0 3.3-1.2l3.5 3.6 1-1-3.6-3.5a5.4 5.4 0 0 0-4.2-8.7Zm-4 5.4a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
        </svg>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search..."
          aria-label="Search review queue"
        />
      </div>

      <button className={styles.filterButton} type="button">
        Queued
      </button>
      <button className={styles.filterButton} type="button">
        My reviews
      </button>
      <button className={styles.filterButton} type="button">
        Other analyst
      </button>
      <button className={styles.filterButton} type="button">
        SLA breached
      </button>
      <button className={styles.filterButton} type="button">
        <span>Risk</span>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
          <path d="m4.2 6 3.8 4 3.8-4H4.2Z" />
        </svg>
      </button>
    </section>
  );
};
