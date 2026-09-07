import type { ReviewQueueItem } from '../model/reviewQueue.types';
import type { ReviewQueueSearchState } from '../model/reviewQueueSearchParams.types';

export interface ReviewQueueRequest extends ReviewQueueSearchState {
  pageSize: number;
}

export interface ReviewQueueResponse {
  items: ReviewQueueItem[];
  total: number;
  page: number;
  pageSize: number;
  updatedAt: string;
  pendingCount: number;
}

export interface IncorporateIncomingCaseResponse {
  incorporatedCaseId: string | null;
}
