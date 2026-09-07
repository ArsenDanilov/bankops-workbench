import styles from './ReviewQueuePage.module.css';

interface ReviewQueueHeaderProps {
  updatedAt?: string;
  isUpdating: boolean;
  updateFailed: boolean;
  onRefresh: () => void;
}

const updatedTime = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: 'Europe/Moscow',
      }).format(new Date(value))
    : '—';

export const ReviewQueueHeader = ({
  updatedAt,
  isUpdating,
  updateFailed,
  onRefresh,
}: ReviewQueueHeaderProps) => {
  return (
    <header className={styles.queueHeader}>
      <h1 className={styles.title}>Review Queue</h1>

      <div className={styles.headerMeta}>
        <p className={styles.workload}>
          12 available · 2 in review by you · 2 SLA breached
        </p>

        <div className={styles.refreshStatus}>
          <span className={styles.updatedAt} aria-live="polite">
            {updateFailed
              ? 'Update failed'
              : isUpdating
                ? 'Updating…'
                : `Updated ${updatedTime(updatedAt)}`}
          </span>
          <span className={styles.refreshControl}>
            <button
              className={styles.iconButton}
              type="button"
              aria-label="Refresh queue"
              disabled={isUpdating}
              onClick={onRefresh}
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20">
                <path d="M15.1 5.3A6.5 6.5 0 1 0 16.5 10h-1.7a4.8 4.8 0 1 1-1-2.9l-2.1 2.1h4.8V4.4l-1.4 1.4v-.5Z" />
              </svg>
            </button>
            <span className={styles.refreshTooltip} aria-hidden="true">
              Refresh queue
            </span>
          </span>
        </div>
      </div>
    </header>
  );
};
