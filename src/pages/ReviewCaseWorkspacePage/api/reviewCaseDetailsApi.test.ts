import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import {
  CANONICAL_REVIEW_CASE_ID,
  canonicalReviewCaseDetails,
} from '../../../mocks/data/reviewCaseDetails.fixtures';
import { server } from '../../../mocks/server';
import {
  fetchReviewCaseDetails,
  ReviewCaseDetailsRequestError,
} from './reviewCaseDetailsApi';
import { reviewCaseDetailsQueryKey } from './reviewCaseDetailsQuery';

describe('Review Case Workspace API client and MSW backend', () => {
  it('returns the canonical grouped details projection and readiness contract', async () => {
    const details = await fetchReviewCaseDetails(CANONICAL_REVIEW_CASE_ID);

    expect(details.case).toMatchObject({
      id: CANONICAL_REVIEW_CASE_ID,
      lifecycle: 'in_review',
      version: 3,
      operationId: 'OP-260907-0718',
    });
    expect(details.ownership.status).toBe('current_analyst');
    expect(details.sla).toEqual({
      state: 'due_soon',
      dueAt: '2026-09-07T13:42:00+03:00',
      remainingMinutes: 11,
    });
    expect(details.contexts.operation).toMatchObject({
      requirement: 'required',
      availability: 'available',
      data: {
        operation: { amount: 286_000, currency: 'RUB', status: 'held' },
      },
    });
    expect(details.contexts.customerBehavior).toMatchObject({
      availability: 'available',
      data: {
        sourceSnapshotId: 'EV-CUST-0314-20260907',
        history: { windowDays: 90, outgoingTransferCount: 46 },
        amounts: {
          current: 286_000,
          median90d: 42_600,
          typicalRange: { minimum: 18_000, maximum: 86_000 },
          deviationMultiplier: 6.7,
        },
        activity: {
          recentOutgoingTransfers: { last24Hours: 1, last7Days: 7 },
        },
      },
    });
    expect(details.contexts.recipientRelationship).toMatchObject({
      availability: 'available',
      data: { relationship: 'new', previousSuccessfulTransferCount: 0 },
    });
    expect(details.contexts.device).toMatchObject({
      requirement: 'required',
      availability: 'available',
      data: {
        current: { operatingSystem: 'Windows 11', browser: 'Chrome' },
      },
    });
    expect(details.contexts.location).toEqual({
      requirement: 'not_relevant',
      availability: 'not_applicable',
    });
    expect(details.contexts.transactionHistory).toMatchObject({
      requirement: 'required',
      availability: 'available',
      data: { sourceSnapshotId: 'EV-CUST-0314-20260907' },
    });
    expect(details.decisionReadiness).toEqual({ status: 'ready' });

    const risk = details.contexts.riskAssessment;
    expect(risk.availability).toBe('available');
    if (risk.availability !== 'available')
      throw new Error('Expected risk data');
    expect(risk.data.signals.map((signal) => signal.code)).toEqual([
      'unusual_amount',
      'new_recipient',
      'device_change',
    ]);
    risk.data.signals.forEach((signal) => {
      expect(signal.evidenceSnapshot.summary).not.toBe('');
      expect(signal).not.toHaveProperty('linkedContext');
    });
    expect(details.contexts.transactionHistory).not.toHaveProperty('rows');
  });

  it('uses a stable case-specific query key', () => {
    expect(reviewCaseDetailsQueryKey(CANONICAL_REVIEW_CASE_ID)).toEqual([
      'review-cases',
      'detail',
      CANONICAL_REVIEW_CASE_ID,
    ]);
  });

  it('distinguishes an unknown case as a typed 404 error', async () => {
    await expect(fetchReviewCaseDetails('RC-UNKNOWN')).rejects.toMatchObject({
      name: 'ReviewCaseDetailsRequestError',
      status: 404,
    });
  });

  it('surfaces a deterministic infrastructure failure', async () => {
    server.use(
      http.get('/api/review-cases/:caseId', () =>
        HttpResponse.json({ message: 'temporary' }, { status: 503 }),
      ),
    );
    await expect(
      fetchReviewCaseDetails(CANONICAL_REVIEW_CASE_ID),
    ).rejects.toEqual(new ReviewCaseDetailsRequestError(503));
  });

  it('forwards cancellation to native fetch', async () => {
    server.use(
      http.get('/api/review-cases/:caseId', async () => {
        await delay(100);
        return HttpResponse.json(canonicalReviewCaseDetails);
      }),
    );
    const controller = new AbortController();
    const response = fetchReviewCaseDetails(
      CANONICAL_REVIEW_CASE_ID,
      controller.signal,
    );
    controller.abort();
    await expect(response).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects a resolved block decision without its required rationale', async () => {
    server.use(
      http.get('/api/review-cases/:caseId', () =>
        HttpResponse.json({
          ...canonicalReviewCaseDetails,
          case: {
            ...canonicalReviewCaseDetails.case,
            lifecycle: 'resolved',
            resolvedAt: '2026-09-07T13:15:00+03:00',
            decision: {
              outcome: 'block',
              analystId: 'analyst-current',
              decidedAt: '2026-09-07T13:15:00+03:00',
            },
          },
        }),
      ),
    );
    await expect(
      fetchReviewCaseDetails(CANONICAL_REVIEW_CASE_ID),
    ).rejects.toThrow('invalid response');
  });
});
