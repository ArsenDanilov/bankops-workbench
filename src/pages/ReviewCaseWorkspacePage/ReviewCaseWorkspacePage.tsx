import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { isReviewCaseNotFoundError } from './api/reviewCaseDetailsApi';
import { reviewCaseDetailsQueryOptions } from './api/reviewCaseDetailsQuery';
import type {
  ReviewCaseLifecycle,
  ReviewCaseOwnership,
} from './model/reviewCase.types';
import styles from './ReviewCaseWorkspacePage.module.css';

const lifecycleLabels: Record<ReviewCaseLifecycle, string> = {
  queued: 'Queued',
  in_review: 'In review',
  resolved: 'Resolved',
  invalidated: 'Invalidated',
};

const ownershipLabel = (ownership: ReviewCaseOwnership) => {
  if (ownership.status === 'unassigned') return 'Unassigned';
  if (ownership.status === 'current_analyst') return 'Current analyst';
  return ownership.analystDisplayName;
};

const amountFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
});

export const ReviewCaseWorkspacePage = () => {
  const { caseId = '' } = useParams();
  const details = useQuery(reviewCaseDetailsQueryOptions(caseId));

  return (
    <div className={styles.page} aria-busy={details.isPending}>
      <div className={styles.content}>
        <Link className={styles.backLink} to="/review-queue">
          Back to Review Queue
        </Link>

        {details.isPending ? (
          <section className={styles.statePanel} aria-live="polite">
            <h1>Loading review case…</h1>
            <p>Loading case details.</p>
          </section>
        ) : details.isError ? (
          isReviewCaseNotFoundError(details.error) ? (
            <section className={styles.statePanel}>
              <h1>Review case not found</h1>
              <p>No review case exists for ID {caseId}.</p>
            </section>
          ) : (
            <section className={styles.statePanel}>
              <h1>Review case could not be loaded</h1>
              <p>Try the request again. Existing Queue data is unaffected.</p>
              <button
                className={styles.retryButton}
                type="button"
                onClick={() => void details.refetch()}
              >
                Retry
              </button>
            </section>
          )
        ) : (
          <article
            className={styles.workspace}
            aria-labelledby="workspace-title"
          >
            <header className={styles.header}>
              <p className={styles.eyebrow}>Workspace data foundation</p>
              <h1 id="workspace-title">Case {details.data.case.id}</h1>
              <dl className={styles.summary}>
                <div>
                  <dt>Lifecycle</dt>
                  <dd>{lifecycleLabels[details.data.case.lifecycle]}</dd>
                </div>
                <div>
                  <dt>Ownership</dt>
                  <dd>{ownershipLabel(details.data.ownership)}</dd>
                </div>
                <div>
                  <dt>Version</dt>
                  <dd>{details.data.case.version}</dd>
                </div>
              </dl>
            </header>

            <section
              className={styles.section}
              aria-labelledby="operation-title"
            >
              <h2 id="operation-title">Operation</h2>
              {details.data.contexts.operation.availability === 'available' ? (
                <p className={styles.primaryValue}>
                  {amountFormatter.format(
                    details.data.contexts.operation.data.operation.amount,
                  )}{' '}
                  {details.data.contexts.operation.data.operation.currency}
                </p>
              ) : (
                <p>Operation context unavailable.</p>
              )}
            </section>

            <section className={styles.section} aria-labelledby="risk-title">
              <h2 id="risk-title">Risk Assessment</h2>
              {details.data.contexts.riskAssessment.availability ===
              'available' ? (
                <p className={styles.primaryValue}>
                  Score {details.data.contexts.riskAssessment.data.score} ·{' '}
                  {details.data.contexts.riskAssessment.data.signals.length}{' '}
                  signals
                </p>
              ) : (
                <p>Risk Assessment unavailable.</p>
              )}
            </section>
          </article>
        )}
      </div>
    </div>
  );
};
