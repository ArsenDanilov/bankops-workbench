import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { isReviewCaseNotFoundError } from './api/reviewCaseDetailsApi';
import { reviewCaseDetailsQueryOptions } from './api/reviewCaseDetailsQuery';
import { CaseOrientation } from './components/CaseOrientation';
import { DecisionRail } from './components/DecisionRail';
import { InvestigationCanvas } from './components/InvestigationCanvas';
import styles from './ReviewCaseWorkspacePage.module.css';

export const ReviewCaseWorkspacePage = () => {
  const { caseId = '' } = useParams();
  const details = useQuery(reviewCaseDetailsQueryOptions(caseId));

  return (
    <div className={styles.page} aria-busy={details.isPending}>
      <div className={styles.content}>
        <div className={styles.navigationRow}>
          <Link
            className={styles.backLink}
            to="/review-queue"
            aria-label="Review Queue"
          >
            <span aria-hidden="true">←</span> Review Queue
          </Link>
        </div>

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
          <>
            <CaseOrientation details={details.data} />
            <div className={styles.workspaceGrid}>
              <InvestigationCanvas details={details.data} />
              <DecisionRail details={details.data} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
