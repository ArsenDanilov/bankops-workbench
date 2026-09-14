import type { ReviewCaseDetails } from '../pages/ReviewCaseWorkspacePage/model/reviewCase.types';
import { canonicalReviewCaseDetails } from './data/reviewCaseDetails.fixtures';

const DEFAULT_LATENCY_MS = 90;
const CLAIM_LATENCY_MS = 600;
const CLAIMED_AT = '2026-09-07T13:09:00+03:00';
const CURRENT_ANALYST = {
  analystId: 'analyst-current',
  analystDisplayName: 'Current analyst',
} as const;
const OTHER_ANALYST = {
  analystId: 'analyst-02',
  analystDisplayName: 'Marta Ruiz',
} as const;

export type MockClaimScenario =
  | 'success'
  | 'claim_conflict'
  | 'case_invalidated';

export type MockClaimResult =
  | { status: 'success'; details: ReviewCaseDetails }
  | {
      status: 'conflict';
      code: 'claim_conflict' | 'case_invalidated';
      details: ReviewCaseDetails;
    };

let latencyMs = DEFAULT_LATENCY_MS;
let detailsByScenario = createInitialDetails();

function createInitialDetails(): Record<MockClaimScenario, ReviewCaseDetails> {
  return {
    success: structuredClone(canonicalReviewCaseDetails),
    claim_conflict: structuredClone(canonicalReviewCaseDetails),
    case_invalidated: structuredClone(canonicalReviewCaseDetails),
  };
}

const asClaimedByCurrentAnalyst = (
  details: ReviewCaseDetails,
): ReviewCaseDetails => ({
  ...details,
  case: {
    id: details.case.id,
    lifecycle: 'in_review',
    version: details.case.version + 1,
    operationId: details.case.operationId,
    assignedAnalystId: CURRENT_ANALYST.analystId,
    startedAt: CLAIMED_AT,
    createdAt: details.case.createdAt,
    updatedAt: CLAIMED_AT,
  },
  ownership: { status: 'current_analyst', ...CURRENT_ANALYST },
  decisionReadiness: { status: 'ready' },
});

const asClaimedByOtherAnalyst = (
  details: ReviewCaseDetails,
): ReviewCaseDetails => ({
  ...details,
  case: {
    id: details.case.id,
    lifecycle: 'in_review',
    version: details.case.version + 1,
    operationId: details.case.operationId,
    assignedAnalystId: OTHER_ANALYST.analystId,
    startedAt: CLAIMED_AT,
    createdAt: details.case.createdAt,
    updatedAt: CLAIMED_AT,
  },
  ownership: { status: 'other_analyst', ...OTHER_ANALYST },
  decisionReadiness: {
    status: 'blocked',
    reasons: ['not_assigned_to_current_analyst'],
  },
});

const asInvalidated = (details: ReviewCaseDetails): ReviewCaseDetails => ({
  ...details,
  case: {
    id: details.case.id,
    lifecycle: 'invalidated',
    version: details.case.version + 1,
    operationId: details.case.operationId,
    createdAt: details.case.createdAt,
    invalidatedAt: CLAIMED_AT,
    updatedAt: CLAIMED_AT,
  },
  decisionReadiness: { status: 'blocked', reasons: ['case_terminal'] },
});

export const readMockReviewCaseDetails = (
  scenario: MockClaimScenario = 'success',
) => ({
  canonical: detailsByScenario[scenario],
  latencyMs,
  claimLatencyMs: CLAIM_LATENCY_MS,
});

export const claimMockReviewCase = (
  expectedVersion: number,
  scenario: MockClaimScenario = 'success',
): MockClaimResult => {
  const current = detailsByScenario[scenario];

  if (
    current.case.lifecycle === 'in_review' &&
    current.ownership.status === 'current_analyst'
  )
    return { status: 'success', details: current };

  if (current.case.lifecycle === 'invalidated')
    return { status: 'conflict', code: 'case_invalidated', details: current };

  if (
    current.case.lifecycle !== 'queued' ||
    current.case.version !== expectedVersion
  )
    return { status: 'conflict', code: 'claim_conflict', details: current };

  if (scenario === 'claim_conflict') {
    const details = asClaimedByOtherAnalyst(current);
    detailsByScenario = { ...detailsByScenario, claim_conflict: details };
    return { status: 'conflict', code: 'claim_conflict', details };
  }

  if (scenario === 'case_invalidated') {
    const details = asInvalidated(current);
    detailsByScenario = { ...detailsByScenario, case_invalidated: details };
    return { status: 'conflict', code: 'case_invalidated', details };
  }

  const details = asClaimedByCurrentAnalyst(current);
  detailsByScenario = { ...detailsByScenario, success: details };
  return { status: 'success', details };
};

export const resetMockReviewCaseDetails = (options?: {
  latencyMs?: number;
}) => {
  detailsByScenario = createInitialDetails();
  latencyMs = options?.latencyMs ?? DEFAULT_LATENCY_MS;
};
