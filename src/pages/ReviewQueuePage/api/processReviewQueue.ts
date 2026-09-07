import { filterReviewQueueItems } from '../lib/filterReviewQueueItems';
import { sortReviewQueueItemsByOperationalOrder } from '../lib/sortReviewQueueItems';
import type { ReviewQueueItem } from '../model/reviewQueue.types';
import type {
  ReviewQueueRequest,
  ReviewQueueResponse,
} from './reviewQueueApi.types';

type ProcessMetadata = Pick<ReviewQueueResponse, 'updatedAt' | 'pendingCount'>;

export const processReviewQueue = (
  dataset: readonly ReviewQueueItem[],
  request: ReviewQueueRequest,
  metadata: ProcessMetadata,
): ReviewQueueResponse => {
  const filtered = filterReviewQueueItems(
    sortReviewQueueItemsByOperationalOrder(dataset),
    request,
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / request.pageSize));
  const page = Math.min(request.page, pageCount);
  const offset = (page - 1) * request.pageSize;

  return {
    items: filtered.slice(offset, offset + request.pageSize),
    total: filtered.length,
    page,
    pageSize: request.pageSize,
    updatedAt: metadata.updatedAt,
    pendingCount: metadata.pendingCount,
  };
};
