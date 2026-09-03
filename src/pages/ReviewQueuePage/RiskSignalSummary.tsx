import { formatRiskSignal } from './lib/reviewQueueFormatters';
import type { ReviewQueueRiskSignal } from './model/reviewQueue.types';
import styles from './ReviewQueueTable.module.css';

interface RiskSignalSummaryProps {
  signals: readonly ReviewQueueRiskSignal[];
}

export const RiskSignalSummary = ({ signals }: RiskSignalSummaryProps) => {
  const visibleSignals = signals.slice(0, 2);
  const overflowCount = signals.length - visibleSignals.length;

  return (
    <div className={styles.riskSummary}>
      <span className={styles.riskMarker} aria-hidden="true" />
      <span className={styles.firstSignal}>
        {formatRiskSignal(visibleSignals[0])}
      </span>
      {visibleSignals[1] ? (
        <>
          <span className={styles.signalSeparator} aria-hidden="true">
            ·
          </span>
          <span className={styles.secondSignal}>
            {formatRiskSignal(visibleSignals[1])}
          </span>
        </>
      ) : null}
      {overflowCount > 0 ? (
        <span className={styles.signalOverflow}>+{overflowCount}</span>
      ) : null}
    </div>
  );
};
