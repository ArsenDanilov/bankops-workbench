import { canonicalReviewCaseDetails } from './data/reviewCaseDetails.fixtures';

const DEFAULT_LATENCY_MS = 90;

let latencyMs = DEFAULT_LATENCY_MS;

export const readMockReviewCaseDetails = () => ({
  canonical: canonicalReviewCaseDetails,
  latencyMs,
});

export const resetMockReviewCaseDetails = (options?: {
  latencyMs?: number;
}) => {
  latencyMs = options?.latencyMs ?? DEFAULT_LATENCY_MS;
};
