import type { ReviewQueueItem } from '../model/reviewQueue.types';

export const sortReviewQueueItemsByOperationalOrder = (
  items: readonly ReviewQueueItem[],
) =>
  [...items].sort(
    (firstItem, secondItem) =>
      firstItem.dueAt.localeCompare(secondItem.dueAt) ||
      firstItem.createdAt.localeCompare(secondItem.createdAt),
  );
