import type { ReviewCaseDetails } from '../model/reviewCase.types';
import {
  formatWorkspaceAmount,
  riskSignalLabels,
} from '../lib/workspaceFormatters';
import styles from '../ReviewCaseWorkspacePage.module.css';

export const DecisionRail = ({ details }: { details: ReviewCaseDetails }) => {
  const operationContext = details.contexts.operation;
  const riskContext = details.contexts.riskAssessment;
  const behaviorContext = details.contexts.customerBehavior;
  const recipientContext = details.contexts.recipientRelationship;
  const operation =
    operationContext.availability === 'available'
      ? operationContext.data
      : null;
  const risk =
    riskContext.availability === 'available' ? riskContext.data : null;
  const behavior =
    behaviorContext.availability === 'available' ? behaviorContext.data : null;
  const recipient =
    recipientContext.availability === 'available'
      ? recipientContext.data
      : null;

  return (
    <aside className={styles.decisionRail} aria-labelledby="decision-title">
      <h2 id="decision-title" className={styles.decisionTitle}>
        Decision
      </h2>
      <p className={styles.decisionCase}>{details.case.id}</p>
      {operation ? (
        <div className={styles.decisionOperation}>
          <strong>
            {formatWorkspaceAmount(
              operation.operation.amount,
              operation.operation.currency,
            )}
          </strong>
          <span>→ {operation.recipient.displayName}</span>
        </div>
      ) : null}

      {risk ? (
        <div className={styles.decisionEvidence}>
          <h3>Key evidence</h3>
          <ul>
            {risk.signals.slice(0, 3).map((signal) => (
              <li key={signal.code}>{riskSignalLabels[signal.code]}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <dl className={styles.decisionFacts}>
        {behavior ? (
          <div>
            <dt>Amount deviation</dt>
            <dd>×{behavior.amounts.deviationMultiplier}</dd>
          </div>
        ) : null}
        {recipient ? (
          <div>
            <dt>Recipient</dt>
            <dd>{recipient.relationship === 'new' ? 'New' : 'Known'}</dd>
          </div>
        ) : null}
      </dl>

      <p className={styles.readiness}>
        <span aria-hidden="true" />
        {details.decisionReadiness.status === 'ready'
          ? 'Ready for decision'
          : 'Decision not ready'}
      </p>
    </aside>
  );
};
