import { useCallback, useState } from 'react';
import styles from './ReviewQueueTable.module.css';
import type { ReviewQueueItem } from './model/reviewQueue.types';
import { ReviewQueueRow } from './ReviewQueueRow';
import { ReviewQueueTableSkeleton } from './ReviewQueueTableSkeleton';

export type ReviewQueueTablePresentationState = 'ready' | 'loading';

interface ReviewQueueTableProps {
  items: readonly ReviewQueueItem[];
  highlightedCaseId?: string | null;
  presentationState?: ReviewQueueTablePresentationState;
}

export const ReviewQueueTable = ({
  items,
  highlightedCaseId = null,
  presentationState = 'ready',
}: ReviewQueueTableProps) => {
  const [openRiskPopoverCaseId, setOpenRiskPopoverCaseId] = useState<
    string | null
  >(null);
  const isLoading = presentationState === 'loading';

  const closeRiskPopover = useCallback(() => {
    setOpenRiskPopoverCaseId(null);
  }, []);

  const toggleRiskPopover = useCallback((caseId: string) => {
    setOpenRiskPopoverCaseId((currentCaseId) =>
      currentCaseId === caseId ? null : caseId,
    );
  }, []);

  return (
    <section
      className={styles.tableRegion}
      aria-label="Review queue results"
      aria-busy={isLoading}
    >
      <table className={styles.table}>
        <caption className={styles.visuallyHidden}>
          Review cases. Fixed order by due time, then created time.
        </caption>
        <colgroup>
          <col className={styles.slaColumn} />
          <col className={styles.caseColumn} />
          <col className={styles.amountColumn} />
          <col className={styles.clientColumn} />
          <col className={styles.recipientColumn} />
          <col />
          <col className={styles.scoreColumn} />
        </colgroup>

        <thead>
          <tr>
            <th className={styles.headerCell} scope="col">
              SLA <span aria-hidden="true">↑</span>
            </th>
            <th className={styles.headerCell} scope="col">
              Case
            </th>
            <th
              className={`${styles.headerCell} ${styles.numericCell}`}
              scope="col"
            >
              Amount
            </th>
            <th className={styles.headerCell} scope="col">
              Client
            </th>
            <th className={styles.headerCell} scope="col">
              Recipient
            </th>
            <th className={styles.headerCell} scope="col">
              Risk signals
            </th>
            <th
              className={`${styles.headerCell} ${styles.numericCell}`}
              scope="col"
            >
              Score
            </th>
          </tr>
        </thead>

        <tbody aria-hidden={isLoading || undefined}>
          {isLoading ? (
            <ReviewQueueTableSkeleton />
          ) : items.length > 0 ? (
            items.map((item) => (
              <ReviewQueueRow
                key={item.caseId}
                item={item}
                isHighlighted={item.caseId === highlightedCaseId}
                isRiskPopoverOpen={item.caseId === openRiskPopoverCaseId}
                onRiskPopoverToggle={() => toggleRiskPopover(item.caseId)}
                onRiskPopoverClose={closeRiskPopover}
              />
            ))
          ) : (
            <tr className={styles.emptyRow}>
              <td className={styles.emptyCell} colSpan={7}>
                No cases match the current search and filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};
