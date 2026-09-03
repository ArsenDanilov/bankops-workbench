import styles from './ReviewQueueTable.module.css';

const SKELETON_ROW_COUNT = 9;

const skeletonRows = Array.from(
  { length: SKELETON_ROW_COUNT },
  (_, index) => index,
);

export const ReviewQueueTableSkeleton = () => {
  return (
    <>
      {skeletonRows.map((rowIndex) => (
        <tr className={styles.skeletonRow} key={rowIndex}>
          <td className={styles.bodyCell}>
            <span className={`${styles.skeletonBlock} ${styles.skeletonSla}`} />
          </td>
          <td className={styles.bodyCell}>
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonCasePrimary}`}
            />
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonCaseSecondary}`}
            />
          </td>
          <td className={`${styles.bodyCell} ${styles.numericCell}`}>
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonAmount}`}
            />
          </td>
          <td className={styles.bodyCell}>
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonName}`}
            />
          </td>
          <td className={styles.bodyCell}>
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonName}`}
            />
          </td>
          <td className={styles.bodyCell}>
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonRisk}`}
            />
          </td>
          <td className={`${styles.bodyCell} ${styles.numericCell}`}>
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonScore}`}
            />
          </td>
        </tr>
      ))}
    </>
  );
};
