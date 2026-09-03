import styles from './ReviewQueueTable.module.css';
import { reviewQueueFixtures } from './model/reviewQueue.fixtures';
import { ReviewQueueRow } from './ReviewQueueRow';

export const ReviewQueueTable = () => {
  return (
    <section className={styles.tableRegion} aria-label="Review queue results">
      <table className={styles.table}>
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
              <span className={styles.visuallyHidden}>
                Ordered by due time, then created time
              </span>
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

        <tbody>
          {reviewQueueFixtures.map((item) => (
            <ReviewQueueRow key={item.caseId} item={item} />
          ))}
        </tbody>
      </table>
    </section>
  );
};
