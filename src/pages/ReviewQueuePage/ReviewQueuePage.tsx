import { QueuePagination } from './QueuePagination';
import { QueueTableFrame } from './QueueTableFrame';
import { QueueToolbar } from './QueueToolbar';
import { ReviewQueueHeader } from './ReviewQueueHeader';
import styles from './ReviewQueuePage.module.css';

export const ReviewQueuePage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <ReviewQueueHeader />
        <QueueToolbar />
        <QueueTableFrame />
        <QueuePagination />
      </div>
    </div>
  );
};
