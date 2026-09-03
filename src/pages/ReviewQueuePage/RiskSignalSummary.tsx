import { useEffect, useRef } from 'react';
import { formatRiskSignal } from './lib/reviewQueueFormatters';
import type { ReviewQueueRiskSignal } from './model/reviewQueue.types';
import styles from './ReviewQueueTable.module.css';

interface RiskSignalSummaryProps {
  caseId: string;
  signals: readonly ReviewQueueRiskSignal[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const RiskSignalSummary = ({
  caseId,
  signals,
  isOpen,
  onToggle,
  onClose,
}: RiskSignalSummaryProps) => {
  const disclosureRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const visibleSignals = signals.slice(0, 2);
  const hiddenSignals = signals.slice(visibleSignals.length);
  const popoverId = `risk-signals-${caseId}`;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !disclosureRef.current?.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isOpen, onClose]);

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
      {hiddenSignals.length > 0 ? (
        <div
          className={styles.riskDisclosure}
          ref={disclosureRef}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && isOpen) {
              event.stopPropagation();
              onClose();
              triggerRef.current?.focus();
            }
          }}
        >
          <button
            className={styles.signalOverflow}
            ref={triggerRef}
            type="button"
            aria-label={`Show ${hiddenSignals.length} more risk signals for case ${caseId}`}
            aria-expanded={isOpen}
            aria-controls={popoverId}
            onClick={onToggle}
          >
            +{hiddenSignals.length}
          </button>

          {isOpen ? (
            <div className={styles.riskPopover} id={popoverId}>
              <ul
                className={styles.riskPopoverList}
                aria-label={`Additional risk signals for case ${caseId}`}
              >
                {hiddenSignals.map((signal) => (
                  <li key={signal}>{formatRiskSignal(signal)}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
