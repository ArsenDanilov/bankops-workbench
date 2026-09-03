import { formatQueueTime, formatSlaPrimary } from './lib/reviewQueueFormatters';
import type {
  ReviewQueueItem,
  ReviewQueueSlaState,
} from './model/reviewQueue.types';
import styles from './ReviewQueueTable.module.css';

interface SlaIndicatorProps {
  item: Pick<ReviewQueueItem, 'dueAt' | 'slaState'>;
}

const slaStateClassNames: Record<ReviewQueueSlaState, string> = {
  normal: styles.slaNormal,
  due_soon: styles.slaDueSoon,
  breached: styles.slaBreached,
};

export const SlaIndicator = ({ item }: SlaIndicatorProps) => {
  return (
    <div
      className={`${styles.slaIndicator} ${slaStateClassNames[item.slaState]}`}
    >
      <span className={styles.slaPrimary}>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="5.5" />
          <path d="M8 4.8v3.5l2.3 1.3" />
        </svg>
        <span>{formatSlaPrimary(item)}</span>
      </span>
      <span className={styles.slaSecondary}>
        Due {formatQueueTime(item.dueAt)}
      </span>
    </div>
  );
};
