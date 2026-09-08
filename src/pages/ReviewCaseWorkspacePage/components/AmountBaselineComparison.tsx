import type { CSSProperties } from 'react';
import { createAmountBaselinePresentation } from '../lib/amountBaselinePresentation';
import { formatWorkspaceAmount } from '../lib/workspaceFormatters';
import type { CustomerBehaviorContext } from '../model/reviewCase.types';
import styles from '../ReviewCaseWorkspacePage.module.css';

interface AmountBaselineComparisonProps {
  amounts: CustomerBehaviorContext['amounts'];
  isActive: boolean;
}

export const AmountBaselineComparison = ({
  amounts,
  isActive,
}: AmountBaselineComparisonProps) => {
  const presentation = createAmountBaselinePresentation(
    amounts.current,
    amounts.median90d,
    amounts.typicalRange.minimum,
    amounts.typicalRange.maximum,
  );
  const rangeWidth =
    presentation.rangeEndPosition - presentation.rangeStartPosition;
  const currentStyle = {
    left: `${presentation.currentPosition}%`,
  } satisfies CSSProperties;
  const medianStyle = {
    left: `${presentation.medianPosition}%`,
  } satisfies CSSProperties;
  const rangeStyle = {
    left: `${presentation.rangeStartPosition}%`,
    width: `${rangeWidth}%`,
  } satisfies CSSProperties;

  return (
    <div
      id="behavior-amount"
      className={`${styles.amountComparison} ${styles.evidenceTarget} ${isActive ? styles.evidenceTargetActive : ''}`}
      tabIndex={-1}
      aria-label="Amount context"
    >
      <div className={styles.amountCurrent}>
        <span>
          <span className={styles.metricLabel}>Current</span>
          <strong>
            {formatWorkspaceAmount(amounts.current, amounts.currency)}
          </strong>
        </span>
        {presentation.isOffScale ? (
          <span className={styles.offScale}>Off scale</span>
        ) : null}
      </div>

      <div className={styles.amountLane} aria-hidden="true">
        <span className={styles.amountTrack} />
        <span className={styles.typicalRangeBand} style={rangeStyle} />
        <span className={styles.medianMarker} style={medianStyle} />
        <span className={styles.currentMarker} style={currentStyle} />
      </div>

      <dl className={styles.baselineMetrics}>
        <div>
          <dt>90d median</dt>
          <dd>{formatWorkspaceAmount(amounts.median90d, amounts.currency)}</dd>
        </div>
        <div>
          <dt>Typical range</dt>
          <dd>
            {formatWorkspaceAmount(
              amounts.typicalRange.minimum,
              amounts.currency,
            )}
            –
            {formatWorkspaceAmount(
              amounts.typicalRange.maximum,
              amounts.currency,
            )}
          </dd>
        </div>
        <div>
          <dt>Deviation</dt>
          <dd>×{amounts.deviationMultiplier}</dd>
        </div>
      </dl>
    </div>
  );
};
