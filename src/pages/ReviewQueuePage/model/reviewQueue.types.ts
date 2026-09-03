export type ReviewQueueLifecycle = 'queued' | 'in_review';

export type ReviewQueueSlaState = 'normal' | 'due_soon' | 'breached';

export type ReviewQueueCurrency = 'RUB' | 'EUR' | 'USD';

export type ReviewQueueRiskSignal =
  | 'unusual_amount'
  | 'new_recipient'
  | 'high_velocity'
  | 'device_change'
  | 'unusual_location';

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
