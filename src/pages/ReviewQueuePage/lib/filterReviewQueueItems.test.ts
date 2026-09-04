import { describe, expect, it } from 'vitest';
import { reviewQueueFixtures } from '../model/reviewQueue.fixtures';
import type { ReviewQueueItem } from '../model/reviewQueue.types';
import type { ReviewQueueSearchState } from '../model/reviewQueueSearchParams.types';
import { filterReviewQueueItems } from './filterReviewQueueItems';

// The production dataset has no other-analyst case. One local variant exercises
// that approved branch without changing the prototype or fabricating many rows.
const otherAnalyst: ReviewQueueItem = {
  ...reviewQueueFixtures[0],
  caseId: 'RC-OTHER',
  operationId: 'OP-OTHER',
  lifecycle: 'in_review',
  ownership: { status: 'another_analyst', analystName: 'Alex' },
  clientName: 'Other client',
  recipientName: 'Other recipient',
  slaState: 'normal',
  riskSignals: ['unusual_amount'],
};
const items = [
  reviewQueueFixtures[0],
  reviewQueueFixtures[1],
  reviewQueueFixtures[4],
  otherAnalyst,
];
const defaults: ReviewQueueSearchState = {
  search: '',
  scopes: [],
  slaBreached: false,
  riskSignals: [],
  page: 1,
};
const ids = (overrides: Partial<ReviewQueueSearchState>) =>
  filterReviewQueueItems(items, { ...defaults, ...overrides }).map(
    (item) => item.caseId,
  );

describe('Queue search and filtering', () => {
  it.each([
    ['Case ID', ' rc-260902-0184 '],
    ['Operation ID', 'op-260902-9031'],
    ['Client', 'ЕЛЕНА'],
    ['Recipient', 'КУЗНЕЦОВ'],
  ])(
    'searches %s with case-insensitive substring matching',
    (_field, search) => {
      expect(ids({ search })).toEqual(['RC-260902-0184']);
    },
  );

  it('does not restrict blank search and empty filter groups or mutate input', () => {
    const before = structuredClone(items);
    expect(ids({ search: '  ' })).toEqual([
      'RC-260902-0184',
      'RC-260902-0189',
      'RC-260902-0207',
      'RC-OTHER',
    ]);
    expect(items).toEqual(before);
  });

  it('distinguishes queued, owned in-review and other-analyst cases; scopes combine with OR', () => {
    expect(ids({ scopes: ['queued'] })).toEqual(['RC-260902-0184']);
    expect(ids({ scopes: ['my_reviews'] })).toEqual([
      'RC-260902-0189',
      'RC-260902-0207',
    ]);
    expect(ids({ scopes: ['other_analyst'] })).toEqual(['RC-OTHER']);
    expect(ids({ scopes: ['queued', 'other_analyst'] })).toEqual([
      'RC-260902-0184',
      'RC-OTHER',
    ]);
  });

  it('filters SLA independently of lifecycle and risk score', () => {
    expect(ids({ slaBreached: true })).toEqual([
      'RC-260902-0184',
      'RC-260902-0189',
    ]);
    expect(ids({ slaBreached: true, scopes: ['my_reviews'] })).toEqual([
      'RC-260902-0189',
    ]);
  });

  it('uses OR within risk selection and AND across search/scope/SLA/risk groups', () => {
    expect(ids({ riskSignals: ['high_velocity', 'unusual_amount'] })).toEqual([
      'RC-260902-0184',
      'RC-260902-0189',
      'RC-OTHER',
    ]);
    expect(
      ids({
        search: 'власов',
        scopes: ['my_reviews'],
        slaBreached: true,
        riskSignals: ['high_velocity', 'unusual_amount'],
      }),
    ).toEqual(['RC-260902-0189']);
    expect(
      ids({
        search: 'власов',
        scopes: ['queued'],
        slaBreached: true,
        riskSignals: ['high_velocity'],
      }),
    ).toEqual([]);
    expect(ids({ search: 'no such case' })).toEqual([]);
  });
});
