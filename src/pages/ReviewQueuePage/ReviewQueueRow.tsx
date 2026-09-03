import { formatQueueAmount } from './lib/reviewQueueFormatters';
import type { ReviewQueueItem } from './model/reviewQueue.types';
import { CaseCell } from './CaseCell';
import { RiskSignalSummary } from './RiskSignalSummary';
import { SlaIndicator } from './SlaIndicator';
import styles from './ReviewQueueTable.module.css';

interface ReviewQueueRowProps {
  item: ReviewQueueItem;
}

export const ReviewQueueRow = ({ item }: ReviewQueueRowProps) => {
  return (
    <tr className={styles.bodyRow}>
      <td className={styles.bodyCell}>
        <SlaIndicator item={item} />
      </td>
      <td className={styles.bodyCell}>
        <CaseCell item={item} />
      </td>
      <td className={`${styles.bodyCell} ${styles.numericCell}`}>
        <span className={styles.amount}>
          {formatQueueAmount(item.amount, item.currency)}
        </span>
      </td>
      <td className={`${styles.bodyCell} ${styles.nameCell}`}>
        <span className={styles.nameText}>{item.clientName}</span>
      </td>
      <td className={`${styles.bodyCell} ${styles.nameCell}`}>
        <span className={styles.nameText}>{item.recipientName}</span>
      </td>
      <td className={styles.bodyCell}>
        <RiskSignalSummary signals={item.riskSignals} />
      </td>
      <td className={`${styles.bodyCell} ${styles.numericCell}`}>
        <span className={styles.score}>{item.riskScore}</span>
      </td>
    </tr>
  );
};
