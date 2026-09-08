export type ReviewCaseLifecycle =
  'queued' | 'in_review' | 'resolved' | 'invalidated';

export type ReviewDecision =
  | Readonly<{
      outcome: 'release';
      comment?: string;
      analystId: string;
      decidedAt: string;
    }>
  | Readonly<{
      outcome: 'block';
      rationale: string;
      analystId: string;
      decidedAt: string;
    }>;

interface ReviewCaseBase {
  id: string;
  version: number;
  operationId: string;
  assignedAnalystId?: string;
  startedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewCase =
  | (ReviewCaseBase & {
      lifecycle: 'queued' | 'in_review';
      resolvedAt?: never;
      invalidatedAt?: never;
      decision?: never;
    })
  | (ReviewCaseBase & {
      lifecycle: 'resolved';
      resolvedAt: string;
      invalidatedAt?: never;
      decision: ReviewDecision;
    })
  | (ReviewCaseBase & {
      lifecycle: 'invalidated';
      resolvedAt?: never;
      invalidatedAt: string;
      decision?: never;
    });

export type ReviewCaseOwnership =
  | { status: 'unassigned' }
  | {
      status: 'current_analyst';
      analystId: string;
      analystDisplayName: string;
    }
  | {
      status: 'other_analyst';
      analystId: string;
      analystDisplayName: string;
    };

export type ReviewCaseSla =
  | {
      state: 'normal' | 'due_soon';
      dueAt: string;
      remainingMinutes: number;
    }
  | {
      state: 'breached';
      dueAt: string;
      breachedMinutes: number;
    };

export type OperationCurrency = 'RUB' | 'EUR' | 'USD';
export type OperationStatus = 'held' | 'processing' | 'completed' | 'declined';

export interface Operation {
  id: string;
  amount: number;
  currency: OperationCurrency;
  initiatedAt: string;
  status: OperationStatus;
}

export interface OperationContext {
  operation: Operation;
  customer: {
    displayName: string;
    maskedSourceAccount: string;
  };
  recipient: {
    displayName: string;
    maskedRecipientAccount: string;
  };
  paymentPurpose?: string;
}

export const REVIEW_CASE_RISK_CODES = [
  'unusual_amount',
  'new_recipient',
  'high_velocity',
  'device_change',
  'unusual_location',
] as const;

export type ReviewCaseRiskCode = (typeof REVIEW_CASE_RISK_CODES)[number];

export interface RiskEvidenceSnapshot {
  summary: string;
  capturedAt: string;
}

export interface RiskSignal {
  code: ReviewCaseRiskCode;
  evidenceSnapshot: RiskEvidenceSnapshot;
}

export interface RiskAssessment {
  readonly id: string;
  readonly score: number;
  readonly assessedAt: string;
  readonly signals: readonly [RiskSignal, ...RiskSignal[]];
}

export interface CustomerBehaviorContext {
  asOf: string;
  sourceSnapshotId: string;
  history: {
    windowDays: number;
    outgoingTransferCount: number;
  };
  amounts: {
    currency: OperationCurrency;
    current: number;
    median90d: number;
    typicalRange: { minimum: number; maximum: number };
    deviationMultiplier: number;
  };
  activity: {
    recentOutgoingTransfers: {
      last24Hours: number;
      last7Days: number;
    };
    usualFrequency: {
      minimum: number;
      maximum: number;
      period: 'week';
    };
  };
}

export type RecipientRelationship =
  | {
      relationship: 'new';
      previousSuccessfulTransferCount: 0;
      firstObservedAt: string;
    }
  | {
      relationship: 'known';
      previousSuccessfulTransferCount: number;
      firstSuccessfulTransferAt: string;
      lastSuccessfulTransferAt: string;
      historicalAmounts: {
        currency: OperationCurrency;
        minimum: number;
        maximum: number;
      };
    };

export interface DeviceContext {
  current: {
    operatingSystem: string;
    browser: string;
  };
  firstSeenAt: string;
  knownRecentPattern?: {
    device: string;
    channel: string;
  };
}

export interface LocationContext {
  country: string;
  city?: string;
  observedAt: string;
}

export interface TransactionHistoryDescriptor {
  sourceSnapshotId: string;
  asOf: string;
}

export type ContextUnavailableReason =
  'source_unavailable' | 'snapshot_missing';

export type RequiredContext<T> =
  | {
      requirement: 'required';
      availability: 'available';
      data: T;
    }
  | {
      requirement: 'required';
      availability: 'unavailable';
      reason: ContextUnavailableReason;
    };

export type ConditionalContext<T> =
  | RequiredContext<T>
  | {
      requirement: 'not_relevant';
      availability: 'not_applicable';
    };

export type DecisionReadinessBlocker =
  | 'case_not_in_review'
  | 'not_assigned_to_current_analyst'
  | 'case_terminal'
  | 'required_context_unavailable'
  | 'operation_not_reviewable';

export type DecisionReadiness =
  | { status: 'ready' }
  | { status: 'blocked'; reasons: readonly DecisionReadinessBlocker[] };

export interface ReviewCaseDetails {
  case: ReviewCase;
  ownership: ReviewCaseOwnership;
  sla: ReviewCaseSla;
  contexts: {
    operation: RequiredContext<OperationContext>;
    riskAssessment: RequiredContext<RiskAssessment>;
    customerBehavior: RequiredContext<CustomerBehaviorContext>;
    recipientRelationship: RequiredContext<RecipientRelationship>;
    device: ConditionalContext<DeviceContext>;
    location: ConditionalContext<LocationContext>;
    transactionHistory: RequiredContext<TransactionHistoryDescriptor>;
  };
  decisionReadiness: DecisionReadiness;
}
