import { useEffect, useRef, useState } from 'react';
import {
  getRenderedEvidenceDestination,
  type EvidenceDestinationId,
} from '../lib/evidenceNavigation';
import {
  formatWorkspaceTime,
  riskSignalLabels,
} from '../lib/workspaceFormatters';
import type {
  RiskAssessment,
  RiskSignal as RiskSignalModel,
} from '../model/reviewCase.types';
import styles from '../ReviewCaseWorkspacePage.module.css';

interface RiskSignalProps {
  signal: RiskSignalModel;
  renderedDestinationIds: ReadonlySet<EvidenceDestinationId>;
  onNavigate: (destinationId: EvidenceDestinationId) => void;
}

const RiskSignal = ({
  signal,
  renderedDestinationIds,
  onNavigate,
}: RiskSignalProps) => {
  const destination = getRenderedEvidenceDestination(
    signal.code,
    renderedDestinationIds,
  );

  return (
    <div className={styles.riskSignal}>
      <span className={styles.riskMarker} aria-hidden="true" />
      <div>
        <h3>{riskSignalLabels[signal.code]}</h3>
        <div className={styles.riskEvidenceLine}>
          <p>{signal.evidenceSnapshot.summary}</p>
          {destination ? (
            <a
              href={`#${destination.id}`}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(destination.id);
              }}
            >
              {destination.label}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};

interface RiskAssessmentSectionProps {
  assessment: RiskAssessment | null;
  renderedDestinationIds: ReadonlySet<EvidenceDestinationId>;
  onNavigate: (destinationId: EvidenceDestinationId) => void;
}

export const RiskAssessmentSection = ({
  assessment,
  renderedDestinationIds,
  onNavigate,
}: RiskAssessmentSectionProps) => {
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(false);
  const disclosureRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const visibleSignals = assessment?.signals.slice(0, 3) ?? [];
  const hiddenSignals = assessment?.signals.slice(3) ?? [];
  const disclosureId = assessment
    ? `additional-risk-signals-${assessment.id}`
    : 'additional-risk-signals';

  useEffect(() => {
    if (!isDisclosureOpen) return undefined;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !disclosureRef.current?.contains(event.target)
      ) {
        setIsDisclosureOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isDisclosureOpen]);

  return (
    <section className={`${styles.evidenceSection} ${styles.riskSection}`}>
      <div className={styles.sectionHeadingRow}>
        <h2 className={styles.sectionTitle}>Risk Assessment</h2>
        {assessment ? (
          <p className={styles.riskMeta}>
            Score {assessment.score} · Assessed{' '}
            {formatWorkspaceTime(assessment.assessedAt)}
          </p>
        ) : null}
      </div>
      {assessment ? (
        <>
          <div className={styles.riskSignals}>
            {visibleSignals.map((signal) => (
              <RiskSignal
                key={signal.code}
                signal={signal}
                renderedDestinationIds={renderedDestinationIds}
                onNavigate={onNavigate}
              />
            ))}
          </div>
          {hiddenSignals.length > 0 ? (
            <div
              className={styles.riskDisclosure}
              ref={disclosureRef}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && isDisclosureOpen) {
                  event.stopPropagation();
                  setIsDisclosureOpen(false);
                  triggerRef.current?.focus();
                }
              }}
            >
              <button
                ref={triggerRef}
                type="button"
                aria-expanded={isDisclosureOpen}
                aria-controls={disclosureId}
                onClick={() => setIsDisclosureOpen((isOpen) => !isOpen)}
              >
                +{hiddenSignals.length} more signals
              </button>
              {isDisclosureOpen ? (
                <div
                  className={styles.riskDisclosurePanel}
                  id={disclosureId}
                  role="group"
                  aria-label="Additional risk signals"
                >
                  {hiddenSignals.map((signal) => (
                    <RiskSignal
                      key={signal.code}
                      signal={signal}
                      renderedDestinationIds={renderedDestinationIds}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <p className={styles.unavailable}>Risk Assessment unavailable.</p>
      )}
    </section>
  );
};
