import { formatLifecycle, formatQueueTime } from './lib/reviewQueueFormatters';
import type {
  ReviewQueueItem,
  ReviewQueueLifecycle,
  ReviewQueueOwnership,
} from './model/reviewQueue.types';
import styles from './ReviewQueueTable.module.css';

interface CaseCellProps {
  item: Pick<
    ReviewQueueItem,
    'caseId' | 'operationId' | 'createdAt' | 'lifecycle' | 'ownership'
  >;
}

const lifecycleClassNames: Record<ReviewQueueLifecycle, string> = {
  queued: styles.lifecycleQueued,
  in_review: styles.lifecycleInReview,
};

const ownershipClassNames: Record<ReviewQueueOwnership['status'], string> = {
  available: styles.ownershipAvailable,
  you: styles.ownershipYou,
  another_analyst: styles.ownershipAnotherAnalyst,
};

const getOwnershipLabel = (ownership: ReviewQueueOwnership) => {
  if (ownership.status === 'another_analyst') {
    return ownership.analystName;
  }

  return ownership.status === 'you' ? 'You' : 'Available';
};

export const CaseCell = ({ item }: CaseCellProps) => {
  return (
    <div className={styles.caseCell}>
      <div className={styles.caseStateLine}>
        <span
          className={`${styles.lifecycle} ${lifecycleClassNames[item.lifecycle]}`}
        >
          {formatLifecycle(item.lifecycle)}
        </span>
        <span
          className={`${styles.ownership} ${ownershipClassNames[item.ownership.status]}`}
        >
          <span className={styles.ownershipMarker} aria-hidden="true" />
          {getOwnershipLabel(item.ownership)}
        </span>
      </div>
      <div className={styles.caseMetadata}>
        {item.caseId} · {item.operationId} · {formatQueueTime(item.createdAt)}
      </div>
    </div>
  );
};
