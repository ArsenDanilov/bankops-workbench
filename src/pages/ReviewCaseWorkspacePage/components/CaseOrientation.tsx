import type { ReviewCaseDetails } from '../model/reviewCase.types';
import {
  formatWorkspaceAmount,
  formatWorkspaceTime,
  lifecycleLabels,
  operationStatusLabels,
} from '../lib/workspaceFormatters';
import styles from '../ReviewCaseWorkspacePage.module.css';

interface CaseOrientationProps {
  details: ReviewCaseDetails;
}

export const CaseOrientation = ({ details }: CaseOrientationProps) => {
  const operationContext = details.contexts.operation;
  const operation =
    operationContext.availability === 'available'
      ? operationContext.data.operation
      : null;
  const slaCopy =
    details.sla.state === 'breached'
      ? `Breached ${details.sla.breachedMinutes} min`
      : `${details.sla.remainingMinutes} min left`;
  const slaClassName =
    details.sla.state === 'breached'
      ? styles.slaBreached
      : details.sla.state === 'due_soon'
        ? styles.slaDueSoon
        : styles.slaNormal;

  return (
    <header className={styles.orientation}>
      <div className={styles.orientationPrimary}>
        <div className={styles.caseIdentity}>
          <h1>{details.case.id}</h1>
          <span className={styles.lifecycleBadge}>
            {lifecycleLabels[details.case.lifecycle]}
          </span>
          <span className={styles.ownership}>
            <span className={styles.ownershipMarker} aria-hidden="true" />
            {details.ownership.status === 'current_analyst'
              ? 'You'
              : details.ownership.status === 'unassigned'
                ? 'Available'
                : details.ownership.analystDisplayName}
          </span>
        </div>
        <div className={`${styles.sla} ${slaClassName}`}>
          <strong>{slaCopy}</strong>
          <span>Due {formatWorkspaceTime(details.sla.dueAt)}</span>
        </div>
      </div>
      <div className={styles.orientationSecondary}>
        {operation ? (
          <>
            <span>
              Outgoing transfer ·{' '}
              {formatWorkspaceAmount(operation.amount, operation.currency)}
            </span>
            <span className={styles.operationStatus}>
              Operation {operationStatusLabels[operation.status]}
            </span>
          </>
        ) : (
          <span>Operation context unavailable</span>
        )}
      </div>
    </header>
  );
};
