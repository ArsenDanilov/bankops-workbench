import type {
  CustomerBehaviorContext,
  DeviceContext,
  OperationContext,
  RecipientRelationship,
  ReviewCaseDetails,
  RiskAssessment,
} from '../model/reviewCase.types';
import {
  formatWorkspaceAmount,
  formatWorkspaceTime,
  isSameWorkspaceDay,
  riskSignalLabels,
} from '../lib/workspaceFormatters';
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

const RiskAssessmentSection = ({
  assessment,
}: {
  assessment: RiskAssessment | null;
}) => (
  <section className={styles.evidenceSection}>
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
      <div className={styles.riskSignals}>
        {assessment.signals.map((signal) => (
          <div className={styles.riskSignal} key={signal.code}>
            <span className={styles.riskMarker} aria-hidden="true" />
            <div>
              <h3>{riskSignalLabels[signal.code]}</h3>
              <p>{signal.evidenceSnapshot.summary}</p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <SectionUnavailable label="Risk Assessment" />
    )}
  </section>
);

const BehaviorSection = ({
  behavior,
}: {
  behavior: CustomerBehaviorContext | null;
}) => (
  <section className={styles.evidenceSection}>
    <h2 className={styles.sectionTitle}>Customer Behavior</h2>
    {behavior ? (
      <dl className={styles.metrics}>
        <div>
          <dt>Current</dt>
          <dd>
            {formatWorkspaceAmount(
              behavior.amounts.current,
              behavior.amounts.currency,
            )}
          </dd>
        </div>
        <div>
          <dt>90d median</dt>
          <dd>
            {formatWorkspaceAmount(
              behavior.amounts.median90d,
              behavior.amounts.currency,
            )}
          </dd>
        </div>
        <div>
          <dt>Typical range</dt>
          <dd>
            {formatWorkspaceAmount(
              behavior.amounts.typicalRange.minimum,
              behavior.amounts.currency,
            )}
            –
            {formatWorkspaceAmount(
              behavior.amounts.typicalRange.maximum,
              behavior.amounts.currency,
            )}
          </dd>
        </div>
        <div>
          <dt>Deviation</dt>
          <dd>×{behavior.amounts.deviationMultiplier}</dd>
        </div>
        <div>
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
    ) : (
      <SectionUnavailable label="Customer behavior" />
    )}
  </section>
);

const RecipientRelationshipSection = ({
  relationship,
  caseCreatedAt,
}: {
  relationship: RecipientRelationship | null;
  caseCreatedAt: string;
}) => (
  <section className={styles.evidenceSection}>
    <h2 className={styles.sectionTitle}>Recipient Relationship</h2>
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

const DeviceContextSection = ({ device }: { device: DeviceContext }) => (
  <section className={styles.deviceSection}>
    <h2 className={styles.sectionTitle}>Device Context</h2>
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
  const operation = details.contexts.operation;
  const risk = details.contexts.riskAssessment;
  const behavior = details.contexts.customerBehavior;
  const recipient = details.contexts.recipientRelationship;
  const device = details.contexts.device;
  const hasDevice =
    device.requirement === 'required' && device.availability === 'available';

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
        />
      </div>
      <div className={styles.horizontalDivider} aria-hidden="true" />
      <div className={styles.contextEvidenceRow}>
        <BehaviorSection
          behavior={
            behavior.availability === 'available' ? behavior.data : null
          }
        />
        <div className={styles.verticalDivider} aria-hidden="true" />
        <RecipientRelationshipSection
          relationship={
            recipient.availability === 'available' ? recipient.data : null
          }
          caseCreatedAt={details.case.createdAt}
        />
      </div>
      {hasDevice ? (
        <>
          <div className={styles.horizontalDivider} aria-hidden="true" />
          <DeviceContextSection device={device.data} />
        </>
      ) : null}
      <TransactionHistoryBoundary details={details} />
    </div>
  );
};
