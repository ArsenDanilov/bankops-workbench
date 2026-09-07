import {
  incomingReviewQueueFixture,
  reviewQueueFixtures,
} from './data/reviewQueue.fixtures';
import type { ReviewQueueItem } from '../pages/ReviewQueuePage/model/reviewQueue.types';

const INITIAL_UPDATED_AT = Date.parse('2026-09-02T13:24:00+03:00');
const DEFAULT_LATENCY_MS = 90;

let dataset: ReviewQueueItem[] = [...reviewQueueFixtures];
let pending: ReviewQueueItem | null = incomingReviewQueueFixture;
let successfulRequests = 0;
let latencyMs = DEFAULT_LATENCY_MS;

export const readMockReviewQueue = () => ({
  dataset,
  pendingCount: pending ? 1 : 0,
  latencyMs,
  nextUpdatedAt: () => {
    const value = new Date(INITIAL_UPDATED_AT + successfulRequests * 60_000);
    successfulRequests += 1;
    return value.toISOString();
  },
});

export const incorporateMockIncomingCase = () => {
  if (!pending) return null;
  const caseId = pending.caseId;
  dataset = [...dataset, pending];
  pending = null;
  return caseId;
};

export const resetMockReviewQueue = (options?: { latencyMs?: number }) => {
  dataset = [...reviewQueueFixtures];
  pending = incomingReviewQueueFixture;
  successfulRequests = 0;
  latencyMs = options?.latencyMs ?? DEFAULT_LATENCY_MS;
};
