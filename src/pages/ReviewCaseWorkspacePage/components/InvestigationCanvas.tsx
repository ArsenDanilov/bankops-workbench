import { useEffect, useRef, useState } from 'react';
import type {
  CustomerBehaviorContext,
  DeviceContext,
  OperationContext,
  RecipientRelationship,
  ReviewCaseDetails,
} from '../model/reviewCase.types';
import {
  formatWorkspaceAmount,
  formatWorkspaceTime,
  isSameWorkspaceDay,
} from '../lib/workspaceFormatters';
import type { EvidenceDestinationId } from '../lib/evidenceNavigation';
import { AmountBaselineComparison } from './AmountBaselineComparison';
import { RiskAssessmentSection } from './RiskAssessmentSection';
import styles from '../ReviewCaseWorkspacePage.module.css';

const SectionUnavailable = ({ label }: { label: string }) => (
  <p className={styles.unavailable}>{label} unavailable.</p>
);

const OperationSection = ({
  context,
}: {
  context: OperationContext | null;
}) => (
  <section className={styles.evidenceSection}>
    <h2 className={styles.sectionTitle}>Operation</h2>
    {context ? (
      <>
        <div className={styles.operationSummary}>
          <strong className={styles.operationAmount}>
            {formatWorkspaceAmount(
              context.operation.amount,
              context.operation.currency,
            )}
          </strong>
          <span>
            Initiated {formatWorkspaceTime(context.operation.initiatedAt)}
          </span>
        </div>
        <div className={styles.parties}>
          <div className={styles.party}>
            <span className={styles.fieldLabel}>Source</span>
            <strong>{context.customer.displayName}</strong>
            <span className={styles.account}>
              {context.customer.maskedSourceAccount}
            </span>
          </div>
          <span className={styles.direction} aria-hidden="true">
            →
          </span>
          <div className={styles.party}>
            <span className={styles.fieldLabel}>Recipient</span>
            <strong>{context.recipient.displayName}</strong>
            <span className={styles.account}>
              {context.recipient.maskedRecipientAccount}
            </span>
          </div>
        </div>
        {context.paymentPurpose ? (
          <p className={styles.purpose}>
            <span className={styles.fieldLabel}>Purpose</span>
            <span>{context.paymentPurpose}</span>
          </p>
        ) : null}
      </>
    ) : (
      <SectionUnavailable label="Operation context" />
    )}
  </section>
);

const BehaviorSection = ({
  behavior,
  activeDestinationId,
}: {
  behavior: CustomerBehaviorContext | null;
  activeDestinationId: EvidenceDestinationId | null;
}) => (
  <section className={styles.evidenceSection}>
    <h2 className={styles.sectionTitle}>Customer Behavior</h2>
    {behavior ? (
      <>
        <AmountBaselineComparison
          amounts={behavior.amounts}
          isActive={activeDestinationId === 'behavior-amount'}
        />
        <dl className={styles.activityMetrics}>
          <div
            id="behavior-activity"
            className={`${styles.evidenceTarget} ${activeDestinationId === 'behavior-activity' ? styles.evidenceTargetActive : ''}`}
            tabIndex={-1}
            aria-label="Recent activity context"
          >
            <dt>Recent outgoing</dt>
            <dd>
              {behavior.activity.recentOutgoingTransfers.last24Hours} / 24h ·{' '}
              {behavior.activity.recentOutgoingTransfers.last7Days} / 7d
            </dd>
          </div>
          <div>
            <dt>Usual frequency</dt>
            <dd>
              {behavior.activity.usualFrequency.minimum}–
              {behavior.activity.usualFrequency.maximum} / week
            </dd>
          </div>
        </dl>
      </>
    ) : (
      <SectionUnavailable label="Customer behavior" />
    )}
  </section>
);

const RecipientRelationshipSection = ({
  relationship,
  caseCreatedAt,
  isActive,
}: {
  relationship: RecipientRelationship | null;
  caseCreatedAt: string;
  isActive: boolean;
}) => (
  <section className={styles.evidenceSection}>
    <h2
      id="recipient-relationship"
      className={`${styles.sectionTitle} ${styles.evidenceTarget} ${isActive ? styles.evidenceTargetActive : ''}`}
      tabIndex={-1}
    >
      Recipient Relationship
    </h2>
    {relationship ? (
      relationship.relationship === 'new' ? (
        <div className={styles.relationshipContent}>
          <p className={styles.relationshipState}>New recipient</p>
          <dl className={styles.relationshipMetrics}>
            <div>
              <dt>Previous transfers</dt>
              <dd>{relationship.previousSuccessfulTransferCount}</dd>
            </div>
            <div>
              <dt>First seen</dt>
              <dd>
                {isSameWorkspaceDay(relationship.firstObservedAt, caseCreatedAt)
                  ? 'Today'
                  : 'Previously'}
              </dd>
            </div>
          </dl>
          <p className={styles.noBaseline}>No historical amount baseline</p>
        </div>
      ) : (
        <div className={styles.relationshipContent}>
          <p className={styles.relationshipState}>Known recipient</p>
          <p>
            {relationship.previousSuccessfulTransferCount} previous transfers
          </p>
        </div>
      )
    ) : (
      <SectionUnavailable label="Recipient relationship" />
    )}
  </section>
);

const DeviceContextSection = ({
  device,
  isActive,
}: {
  device: DeviceContext;
  isActive: boolean;
}) => (
  <section className={styles.deviceSection}>
    <h2
      id="device-context"
      className={`${styles.sectionTitle} ${styles.evidenceTarget} ${isActive ? styles.evidenceTargetActive : ''}`}
      tabIndex={-1}
    >
      Device Context
    </h2>
    <div className={styles.deviceComparison}>
      <p>
        <span className={styles.fieldLabel}>Current</span>
        <span>
          {device.current.operatingSystem} · {device.current.browser} · first
          seen today
        </span>
      </p>
      {device.knownRecentPattern ? (
        <p>
          <span className={styles.fieldLabel}>Known</span>
          <span>
            {device.knownRecentPattern.device} · recent/primary device pattern
          </span>
        </p>
      ) : null}
    </div>
  </section>
);

const TransactionHistoryBoundary = ({
  details,
}: {
  details: ReviewCaseDetails;
}) => {
  const history = details.contexts.transactionHistory;
  return (
    <section className={styles.historyBoundary}>
      <h2 className={styles.sectionTitle}>Transaction History</h2>
      <p>
        {history.availability === 'available'
          ? 'Required context · Evidence available for continued investigation'
          : 'Required context unavailable'}
      </p>
    </section>
  );
};

export const InvestigationCanvas = ({
  details,
}: {
  details: ReviewCaseDetails;
}) => {
  const [activeDestinationId, setActiveDestinationId] =
    useState<EvidenceDestinationId | null>(null);
  const acknowledgmentTimer = useRef<number | undefined>(undefined);
  const operation = details.contexts.operation;
  const risk = details.contexts.riskAssessment;
  const behavior = details.contexts.customerBehavior;
  const recipient = details.contexts.recipientRelationship;
  const device = details.contexts.device;
  const hasDevice =
    device.requirement === 'required' && device.availability === 'available';
  const renderedDestinationIds = new Set<EvidenceDestinationId>();

  if (behavior.availability === 'available') {
    renderedDestinationIds.add('behavior-amount');
    renderedDestinationIds.add('behavior-activity');
  }
  if (recipient.availability === 'available') {
    renderedDestinationIds.add('recipient-relationship');
  }
  if (hasDevice) renderedDestinationIds.add('device-context');

  useEffect(
    () => () => {
      if (acknowledgmentTimer.current !== undefined)
        window.clearTimeout(acknowledgmentTimer.current);
    },
    [],
  );

  const navigateToEvidence = (destinationId: EvidenceDestinationId) => {
    const destination = document.getElementById(destinationId);
    if (!destination) return;

    if (acknowledgmentTimer.current !== undefined)
      window.clearTimeout(acknowledgmentTimer.current);

    setActiveDestinationId(destinationId);
    destination.focus({ preventScroll: true });

    const bounds = destination.getBoundingClientRect();
    const isVisible = bounds.top >= 72 && bounds.bottom <= window.innerHeight;
    if (!isVisible && typeof destination.scrollIntoView === 'function') {
      const reducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      destination.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }

    acknowledgmentTimer.current = window.setTimeout(
      () => setActiveDestinationId(null),
      900,
    );
  };

  return (
    <div className={styles.investigationCanvas}>
      <div className={styles.primaryEvidenceRow}>
        <OperationSection
          context={
            operation.availability === 'available' ? operation.data : null
          }
        />
        <div className={styles.verticalDivider} aria-hidden="true" />
        <RiskAssessmentSection
          assessment={risk.availability === 'available' ? risk.data : null}
          renderedDestinationIds={renderedDestinationIds}
          onNavigate={navigateToEvidence}
        />
      </div>
      <div className={styles.horizontalDivider} aria-hidden="true" />
      <div className={styles.contextEvidenceRow}>
        <BehaviorSection
          behavior={
            behavior.availability === 'available' ? behavior.data : null
          }
          activeDestinationId={activeDestinationId}
        />
        <div className={styles.verticalDivider} aria-hidden="true" />
        <RecipientRelationshipSection
          relationship={
            recipient.availability === 'available' ? recipient.data : null
          }
          caseCreatedAt={details.case.createdAt}
          isActive={activeDestinationId === 'recipient-relationship'}
        />
      </div>
      {hasDevice ? (
        <>
          <div className={styles.horizontalDivider} aria-hidden="true" />
          <DeviceContextSection
            device={device.data}
            isActive={activeDestinationId === 'device-context'}
          />
        </>
      ) : null}
      <TransactionHistoryBoundary details={details} />
    </div>
  );
};
