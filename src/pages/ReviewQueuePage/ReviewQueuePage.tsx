import { QueuePagination } from './QueuePagination';
import { QueueToolbar } from './QueueToolbar';
import { ReviewQueueHeader } from './ReviewQueueHeader';
import styles from './ReviewQueuePage.module.css';
import { ReviewQueueTable } from './ReviewQueueTable';

export const ReviewQueuePage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <ReviewQueueHeader />
        <QueueToolbar />
        <div className={styles.toolbarSeparator} aria-hidden="true" />
        <ReviewQueueTable />
        <QueuePagination />
      </div>
    </div>
  );
};
