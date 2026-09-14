import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import {
  claimReviewCase,
  ReviewCaseClaimError,
} from '../api/reviewCaseDetailsApi';
import { reviewCaseDetailsQueryKey } from '../api/reviewCaseDetailsQuery';
import type { ReviewCaseDetails } from '../model/reviewCase.types';
import {
  formatWorkspaceAmount,
  riskSignalLabels,
} from '../lib/workspaceFormatters';
import styles from '../ReviewCaseWorkspacePage.module.css';

export const DecisionRail = ({ details }: { details: ReviewCaseDetails }) => {
  const queryClient = useQueryClient();
  const workflowRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState<{
    kind: 'status' | 'alert';
    text: string;
  } | null>(null);
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
  const canClaim =
    details.case.lifecycle === 'queued' &&
    details.ownership.status === 'unassigned';

  const focusWorkflow = () =>
    window.requestAnimationFrame(() => workflowRef.current?.focus());

  const claim = useMutation({
    mutationFn: () => claimReviewCase(details.case.id, details.case.version),
    retry: false,
    onSuccess: async (current) => {
      queryClient.setQueryData(reviewCaseDetailsQueryKey(details.case.id), current);
      await queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      setAnnouncement({
        kind: 'status',
        text: 'Case taken into review. You are now the assigned analyst.',
      });
      focusWorkflow();
    },
    onError: async (error) => {
      if (error instanceof ReviewCaseClaimError && error.current) {
        queryClient.setQueryData(
          reviewCaseDetailsQueryKey(details.case.id),
          error.current,
        );
        await queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
        setAnnouncement({
          kind: 'alert',
          text:
            error.code === 'case_invalidated'
              ? 'Claim failed. This case was invalidated and is no longer available.'
              : 'Claim failed. Another analyst took this case into review.',
        });
        focusWorkflow();
        return;
      }

      setAnnouncement({
        kind: 'alert',
        text: 'The case could not be taken into review. Try again.',
      });
    },
  });

  const workflowState =
    details.case.lifecycle === 'invalidated'
      ? {
          title: 'Case invalidated',
          copy: 'This case is no longer available for review.',
        }
      : details.case.lifecycle === 'resolved'
        ? { title: 'Case resolved', copy: 'This case is read-only.' }
        : details.ownership.status === 'current_analyst'
          ? {
              title: 'In review by you',
              copy: 'You are the assigned analyst for this case.',
            }
          : details.ownership.status === 'other_analyst'
            ? {
                title: `In review by ${details.ownership.analystDisplayName}`,
                copy: 'The case remains readable, but actions are read-only.',
              }
            : {
                title: 'Available for review',
                copy: 'Opening this case did not assign it to you.',
              };

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

      <p
        className={`${styles.readiness} ${
          details.decisionReadiness.status === 'ready'
            ? styles.readinessReady
            : styles.readinessBlocked
        }`}
      >
        <span aria-hidden="true" />
        {details.decisionReadiness.status === 'ready'
          ? 'Ready for decision'
          : 'Decision not ready'}
      </p>

      <div
        ref={workflowRef}
        className={styles.claimWorkflow}
        tabIndex={-1}
      >
        <h3>{workflowState.title}</h3>
        <p>{workflowState.copy}</p>
        {canClaim ? (
          <button
            className={styles.claimButton}
            type="button"
            disabled={claim.isPending}
            aria-describedby="claim-state"
            onClick={() => {
              setAnnouncement(null);
              claim.mutate();
            }}
          >
            {claim.isPending ? 'Taking into review…' : 'Take into review'}
          </button>
        ) : null}
        <span id="claim-state" className={styles.srOnly}>
          {claim.isPending ? 'Claim request in progress.' : ''}
        </span>
      </div>

      {announcement ? (
        <p
          className={
            announcement.kind === 'alert'
              ? styles.claimAlert
              : styles.claimAnnouncement
          }
          role={announcement.kind}
        >
          {announcement.text}
        </p>
      ) : null}
    </aside>
  );
};
