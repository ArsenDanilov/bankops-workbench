import type { ReviewQueueItem } from '../model/reviewQueue.types';
import type {
  ReviewQueueScope,
  ReviewQueueSearchState,
} from '../model/reviewQueueSearchParams.types';

const matchesScope = (item: ReviewQueueItem, scope: ReviewQueueScope) => {
  switch (scope) {
    case 'queued':
      return item.lifecycle === 'queued';
    case 'my_reviews':
      return item.lifecycle === 'in_review' && item.ownership.status === 'you';
    case 'other_analyst':
      return (
        item.lifecycle === 'in_review' &&
        item.ownership.status === 'another_analyst'
      );
  }
};

export const filterReviewQueueItems = (
  items: readonly ReviewQueueItem[],
  state: ReviewQueueSearchState,
) => {
  const normalizedSearch = state.search.trim().toLocaleLowerCase();

  return items.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      [item.caseId, item.operationId, item.clientName, item.recipientName].some(
        (value) => value.toLocaleLowerCase().includes(normalizedSearch),
      );

    const matchesSelectedScope =
      state.scopes.length === 0 ||
      state.scopes.some((scope) => matchesScope(item, scope));

    const matchesSla = !state.slaBreached || item.slaState === 'breached';

    const matchesRiskSignal =
      state.riskSignals.length === 0 ||
      item.riskSignals.some((riskSignal) =>
        state.riskSignals.includes(riskSignal),
      );

    return (
      matchesSearch && matchesSelectedScope && matchesSla && matchesRiskSignal
    );
  });
};
