import {
  REVIEW_CASE_RISK_CODES,
  type CustomerBehaviorContext,
  type DeviceContext,
  type LocationContext,
  type OperationContext,
  type RecipientRelationship,
  type ReviewCase,
  type ReviewCaseDetails,
  type ReviewCaseOwnership,
  type ReviewCaseSla,
  type RiskAssessment,
  type TransactionHistoryDescriptor,
} from '../model/reviewCase.types';

export class ReviewCaseDetailsRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(
      status === 404
        ? 'Review case was not found'
        : `Review case request failed (${status})`,
    );
    this.name = 'ReviewCaseDetailsRequestError';
    this.status = status;
  }
}

export type ReviewCaseClaimErrorCode =
  | 'claim_conflict'
  | 'case_invalidated';

export class ReviewCaseClaimError extends Error {
  readonly status: number;
  readonly code?: ReviewCaseClaimErrorCode;
  readonly current?: ReviewCaseDetails;

  constructor(
    status: number,
    code?: ReviewCaseClaimErrorCode,
    current?: ReviewCaseDetails,
  ) {
    super(
      code === 'claim_conflict'
        ? 'Another analyst already took this case into review'
        : code === 'case_invalidated'
          ? 'This case was invalidated before it could be claimed'
          : `Review case claim failed (${status})`,
    );
    this.name = 'ReviewCaseClaimError';
    this.status = status;
    this.code = code;
    this.current = current;
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isPositiveInteger = (value: unknown) =>
  isNumber(value) && Number.isInteger(value) && value > 0;
const isIsoDate = (value: unknown) =>
  isString(value) && !Number.isNaN(Date.parse(value));
const isOptionalIsoDate = (value: unknown) =>
  value === undefined || isIsoDate(value);

const isReviewDecision = (value: unknown) => {
  if (
    !isObject(value) ||
    !isString(value.analystId) ||
    !isIsoDate(value.decidedAt)
  )
    return false;
  if (value.outcome === 'release')
    return value.comment === undefined || isString(value.comment);
  return (
    value.outcome === 'block' &&
    isString(value.rationale) &&
    value.rationale.length > 0
  );
};

const isReviewCase = (value: unknown): value is ReviewCase => {
  if (
    !isObject(value) ||
    !isString(value.id) ||
    !isPositiveInteger(value.version) ||
    !isString(value.operationId) ||
    (value.assignedAnalystId !== undefined &&
      !isString(value.assignedAnalystId)) ||
    !isOptionalIsoDate(value.startedAt) ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt)
  )
    return false;
  if (value.lifecycle === 'queued' || value.lifecycle === 'in_review')
    return (
      value.resolvedAt === undefined &&
      value.invalidatedAt === undefined &&
      value.decision === undefined
    );
  if (value.lifecycle === 'resolved')
    return (
      isIsoDate(value.resolvedAt) &&
      value.invalidatedAt === undefined &&
      isReviewDecision(value.decision)
    );
  return (
    value.lifecycle === 'invalidated' &&
    value.resolvedAt === undefined &&
    isIsoDate(value.invalidatedAt) &&
    value.decision === undefined
  );
};

const isReviewCaseOwnership = (
  value: unknown,
): value is ReviewCaseOwnership => {
  if (!isObject(value)) return false;
  if (value.status === 'unassigned') return true;
  return (
    (value.status === 'current_analyst' || value.status === 'other_analyst') &&
    isString(value.analystId) &&
    isString(value.analystDisplayName)
  );
};

const isReviewCaseSla = (value: unknown): value is ReviewCaseSla => {
  if (!isObject(value) || !isIsoDate(value.dueAt)) return false;
  if (value.state === 'normal' || value.state === 'due_soon')
    return isNumber(value.remainingMinutes) && value.remainingMinutes >= 0;
  return (
    value.state === 'breached' &&
    isNumber(value.breachedMinutes) &&
    value.breachedMinutes >= 0
  );
};

const isCurrency = (value: unknown) =>
  value === 'RUB' || value === 'EUR' || value === 'USD';

const isOperationContext = (value: unknown): value is OperationContext => {
  if (
    !isObject(value) ||
    !isObject(value.operation) ||
    !isObject(value.customer) ||
    !isObject(value.recipient)
  )
    return false;
  const operation = value.operation;
  return (
    isString(operation.id) &&
    isNumber(operation.amount) &&
    isCurrency(operation.currency) &&
    isIsoDate(operation.initiatedAt) &&
    ['held', 'processing', 'completed', 'declined'].includes(
      String(operation.status),
    ) &&
    isString(value.customer.displayName) &&
    isString(value.customer.maskedSourceAccount) &&
    isString(value.recipient.displayName) &&
    isString(value.recipient.maskedRecipientAccount) &&
    (value.paymentPurpose === undefined || isString(value.paymentPurpose))
  );
};

const isRiskAssessment = (value: unknown): value is RiskAssessment =>
  isObject(value) &&
  isString(value.id) &&
  isNumber(value.score) &&
  isIsoDate(value.assessedAt) &&
  Array.isArray(value.signals) &&
  value.signals.length > 0 &&
  value.signals.every(
    (signal) =>
      isObject(signal) &&
      isString(signal.code) &&
      REVIEW_CASE_RISK_CODES.some((code) => code === signal.code) &&
      isObject(signal.evidenceSnapshot) &&
      isString(signal.evidenceSnapshot.summary) &&
      isIsoDate(signal.evidenceSnapshot.capturedAt),
  );

const isCustomerBehaviorContext = (
  value: unknown,
): value is CustomerBehaviorContext => {
  if (
    !isObject(value) ||
    !isObject(value.history) ||
    !isObject(value.amounts) ||
    !isObject(value.amounts.typicalRange) ||
    !isObject(value.activity) ||
    !isObject(value.activity.recentOutgoingTransfers) ||
    !isObject(value.activity.usualFrequency)
  )
    return false;
  return (
    isIsoDate(value.asOf) &&
    isString(value.sourceSnapshotId) &&
    isPositiveInteger(value.history.windowDays) &&
    isNumber(value.history.outgoingTransferCount) &&
    isCurrency(value.amounts.currency) &&
    isNumber(value.amounts.current) &&
    isNumber(value.amounts.median90d) &&
    isNumber(value.amounts.typicalRange.minimum) &&
    isNumber(value.amounts.typicalRange.maximum) &&
    isNumber(value.amounts.deviationMultiplier) &&
    isNumber(value.activity.recentOutgoingTransfers.last24Hours) &&
    isNumber(value.activity.recentOutgoingTransfers.last7Days) &&
    isNumber(value.activity.usualFrequency.minimum) &&
    isNumber(value.activity.usualFrequency.maximum) &&
    value.activity.usualFrequency.period === 'week'
  );
};

const isRecipientRelationship = (
  value: unknown,
): value is RecipientRelationship => {
  if (!isObject(value)) return false;
  if (value.relationship === 'new')
    return (
      value.previousSuccessfulTransferCount === 0 &&
      isIsoDate(value.firstObservedAt)
    );
  return (
    value.relationship === 'known' &&
    isPositiveInteger(value.previousSuccessfulTransferCount) &&
    isIsoDate(value.firstSuccessfulTransferAt) &&
    isIsoDate(value.lastSuccessfulTransferAt) &&
    isObject(value.historicalAmounts) &&
    isCurrency(value.historicalAmounts.currency) &&
    isNumber(value.historicalAmounts.minimum) &&
    isNumber(value.historicalAmounts.maximum)
  );
};

const isDeviceContext = (value: unknown): value is DeviceContext =>
  isObject(value) &&
  isObject(value.current) &&
  isString(value.current.operatingSystem) &&
  isString(value.current.browser) &&
  isIsoDate(value.firstSeenAt) &&
  (value.knownRecentPattern === undefined ||
    (isObject(value.knownRecentPattern) &&
      isString(value.knownRecentPattern.device) &&
      isString(value.knownRecentPattern.channel)));

const isLocationContext = (value: unknown): value is LocationContext =>
  isObject(value) &&
  isString(value.country) &&
  (value.city === undefined || isString(value.city)) &&
  isIsoDate(value.observedAt);

const isTransactionHistoryDescriptor = (
  value: unknown,
): value is TransactionHistoryDescriptor =>
  isObject(value) && isString(value.sourceSnapshotId) && isIsoDate(value.asOf);

const isRequiredContext = <T>(
  value: unknown,
  isData: (data: unknown) => data is T,
) => {
  if (!isObject(value) || value.requirement !== 'required') return false;
  if (value.availability === 'available') return isData(value.data);
  return (
    value.availability === 'unavailable' &&
    (value.reason === 'source_unavailable' ||
      value.reason === 'snapshot_missing')
  );
};

const isConditionalContext = <T>(
  value: unknown,
  isData: (data: unknown) => data is T,
) =>
  (isObject(value) &&
    value.requirement === 'not_relevant' &&
    value.availability === 'not_applicable') ||
  isRequiredContext(value, isData);

const isDecisionReadiness = (value: unknown) => {
  if (!isObject(value)) return false;
  if (value.status === 'ready') return true;
  const blockers = [
    'case_not_in_review',
    'not_assigned_to_current_analyst',
    'case_terminal',
    'required_context_unavailable',
    'operation_not_reviewable',
  ];
  return (
    value.status === 'blocked' &&
    Array.isArray(value.reasons) &&
    value.reasons.length > 0 &&
    value.reasons.every((reason) => blockers.includes(String(reason)))
  );
};

const parseReviewCaseDetails = (value: unknown): ReviewCaseDetails => {
  if (
    !isObject(value) ||
    !isReviewCase(value.case) ||
    !isReviewCaseOwnership(value.ownership) ||
    !isReviewCaseSla(value.sla) ||
    !isObject(value.contexts) ||
    !isRequiredContext(value.contexts.operation, isOperationContext) ||
    !isRequiredContext(value.contexts.riskAssessment, isRiskAssessment) ||
    !isRequiredContext(
      value.contexts.customerBehavior,
      isCustomerBehaviorContext,
    ) ||
    !isRequiredContext(
      value.contexts.recipientRelationship,
      isRecipientRelationship,
    ) ||
    !isConditionalContext(value.contexts.device, isDeviceContext) ||
    !isConditionalContext(value.contexts.location, isLocationContext) ||
    !isRequiredContext(
      value.contexts.transactionHistory,
      isTransactionHistoryDescriptor,
    ) ||
    !isDecisionReadiness(value.decisionReadiness)
  )
    throw new Error('Review case details API returned an invalid response');
  return value as unknown as ReviewCaseDetails;
};

const endpoint = (caseId: string) =>
  new URL(
    `/api/review-cases/${encodeURIComponent(caseId)}`,
    window.location.origin,
  );

export const fetchReviewCaseDetails = async (
  caseId: string,
  signal?: AbortSignal,
) => {
  const response = await fetch(endpoint(caseId), { signal });
  if (!response.ok) throw new ReviewCaseDetailsRequestError(response.status);
  return parseReviewCaseDetails((await response.json()) as unknown);
};

export const claimReviewCase = async (
  caseId: string,
  expectedVersion: number,
) => {
  const response = await fetch(
    new URL(
      `/api/review-cases/${encodeURIComponent(caseId)}/claim`,
      window.location.origin,
    ),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedVersion }),
    },
  );

  const body = (await response.json()) as unknown;
  if (response.ok) return parseReviewCaseDetails(body);

  if (
    response.status === 409 &&
    isObject(body) &&
    (body.code === 'claim_conflict' || body.code === 'case_invalidated')
  ) {
    let current: ReviewCaseDetails | undefined;
    try {
      current = parseReviewCaseDetails(body.current);
    } catch {
      current = undefined;
    }
    throw new ReviewCaseClaimError(response.status, body.code, current);
  }

  throw new ReviewCaseClaimError(response.status);
};

export const isReviewCaseNotFoundError = (error: unknown) =>
  error instanceof ReviewCaseDetailsRequestError && error.status === 404;
