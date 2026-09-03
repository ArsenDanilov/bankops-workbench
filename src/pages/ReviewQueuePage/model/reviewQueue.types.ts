export type ReviewQueueLifecycle = 'queued' | 'in_review';

export type ReviewQueueSlaState = 'normal' | 'due_soon' | 'breached';

export type ReviewQueueCurrency = 'RUB' | 'EUR' | 'USD';

export const REVIEW_QUEUE_RISK_SIGNALS = [
  'unusual_amount',
  'new_recipient',
  'high_velocity',
  'device_change',
  'unusual_location',
] as const;

export type ReviewQueueRiskSignal = (typeof REVIEW_QUEUE_RISK_SIGNALS)[number];

export type ReviewQueueOwnership =
  | { status: 'available' }
  | { status: 'you' }
  | { status: 'another_analyst'; analystName: string };

export interface ReviewQueueItem {
  caseId: string;
  operationId: string;
  lifecycle: ReviewQueueLifecycle;
  ownership: ReviewQueueOwnership;
  createdAt: string;
  dueAt: string;
  slaState: ReviewQueueSlaState;
  amount: number;
  currency: ReviewQueueCurrency;
  clientName: string;
  recipientName: string;
  riskScore: number;
  riskSignals: readonly [ReviewQueueRiskSignal, ...ReviewQueueRiskSignal[]];
}
