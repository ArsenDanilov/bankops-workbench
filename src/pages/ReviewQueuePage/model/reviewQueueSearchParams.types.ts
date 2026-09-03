import type { ReviewQueueRiskSignal } from './reviewQueue.types';

export const REVIEW_QUEUE_PAGE_SIZE = 25;

export const REVIEW_QUEUE_SCOPES = [
  'queued',
  'my_reviews',
  'other_analyst',
] as const;

export type ReviewQueueScope = (typeof REVIEW_QUEUE_SCOPES)[number];

export interface ReviewQueueSearchState {
  search: string;
  scopes: readonly ReviewQueueScope[];
  slaBreached: boolean;
  riskSignals: readonly ReviewQueueRiskSignal[];
  page: number;
}

export interface ParsedReviewQueueSearchState {
  state: ReviewQueueSearchState;
  pageParamNeedsNormalization: boolean;
}
