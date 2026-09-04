import { expect, it } from 'vitest';
import { reviewQueueFixtures } from '../model/reviewQueue.fixtures';
import { sortReviewQueueItemsByOperationalOrder } from './sortReviewQueueItems';

it('orders by dueAt then createdAt without mutating input or sorting by risk', () => {
  const base = reviewQueueFixtures[0];
  const first = {
    ...base,
    caseId: 'first',
    dueAt: '2026-09-02T13:00:00',
    riskScore: 1,
  };
  const second = {
    ...base,
    caseId: 'second',
    dueAt: '2026-09-02T14:00:00',
    createdAt: '2026-09-02T12:00:00',
  };
  const third = {
    ...base,
    caseId: 'third',
    dueAt: '2026-09-02T14:00:00',
    createdAt: '2026-09-02T12:30:00',
    riskScore: 99,
  };
  const input = [third, first, second];
  expect(sortReviewQueueItemsByOperationalOrder(input)).toEqual([
    first,
    second,
    third,
  ]);
  expect(input).toEqual([third, first, second]);
});
