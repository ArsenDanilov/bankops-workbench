import {
  REVIEW_QUEUE_RISK_SIGNALS,
  type ReviewQueueItem,
} from '../model/reviewQueue.types';
import { REVIEW_QUEUE_SCOPES } from '../model/reviewQueueSearchParams.types';
import type {
  IncorporateIncomingCaseResponse,
  ReviewQueueRequest,
  ReviewQueueResponse,
} from './reviewQueueApi.types';

const endpoint = () => new URL('/api/review-cases', window.location.origin);

export const createReviewQueueApiSearchParams = (
  request: ReviewQueueRequest,
) => {
  const params = new URLSearchParams();
  if (request.search.trim()) params.set('q', request.search);
  request.scopes.forEach((scope) => params.append('scope', scope));
  if (request.slaBreached) params.set('sla', 'breached');
  request.riskSignals.forEach((signal) => params.append('risk', signal));
  params.set('page', String(request.page));
  params.set('pageSize', String(request.pageSize));
  return params;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isReviewQueueItem = (value: unknown): value is ReviewQueueItem => {
  if (!isObject(value) || !isObject(value.ownership)) return false;
  const ownership = value.ownership;
  const ownershipValid =
    ownership.status === 'available' ||
    ownership.status === 'you' ||
    (ownership.status === 'another_analyst' &&
      typeof ownership.analystName === 'string');
  return (
    typeof value.caseId === 'string' &&
    typeof value.operationId === 'string' &&
    (value.lifecycle === 'queued' || value.lifecycle === 'in_review') &&
    ownershipValid &&
    typeof value.createdAt === 'string' &&
    typeof value.dueAt === 'string' &&
    (value.slaState === 'normal' ||
      value.slaState === 'due_soon' ||
      value.slaState === 'breached') &&
    typeof value.amount === 'number' &&
    (value.currency === 'RUB' ||
      value.currency === 'EUR' ||
      value.currency === 'USD') &&
    typeof value.clientName === 'string' &&
    typeof value.recipientName === 'string' &&
    typeof value.riskScore === 'number' &&
    Array.isArray(value.riskSignals) &&
    value.riskSignals.length > 0 &&
    value.riskSignals.every(
      (signal) =>
        typeof signal === 'string' &&
        REVIEW_QUEUE_RISK_SIGNALS.some((supported) => supported === signal),
    )
  );
};

const parseQueueResponse = (value: unknown): ReviewQueueResponse => {
  if (
    !isObject(value) ||
    !Array.isArray(value.items) ||
    !value.items.every(isReviewQueueItem) ||
    typeof value.total !== 'number' ||
    typeof value.page !== 'number' ||
    typeof value.pageSize !== 'number' ||
    typeof value.updatedAt !== 'string' ||
    Number.isNaN(Date.parse(value.updatedAt)) ||
    typeof value.pendingCount !== 'number'
  )
    throw new Error('Review queue API returned an invalid response');
  return value as unknown as ReviewQueueResponse;
};

const parseIncorporationResponse = (
  value: unknown,
): IncorporateIncomingCaseResponse => {
  if (
    !isObject(value) ||
    (value.incorporatedCaseId !== null &&
      typeof value.incorporatedCaseId !== 'string')
  )
    throw new Error('Incoming-case API returned an invalid response');
  return { incorporatedCaseId: value.incorporatedCaseId };
};

const expectOk = async (response: Response) => {
  if (!response.ok)
    throw new Error(`Review queue request failed (${response.status})`);
  return response.json() as Promise<unknown>;
};

export const fetchReviewQueue = async (
  request: ReviewQueueRequest,
  signal?: AbortSignal,
) => {
  const url = endpoint();
  url.search = createReviewQueueApiSearchParams(request).toString();
  return parseQueueResponse(await expectOk(await fetch(url, { signal })));
};

export const incorporateIncomingReviewCase = async (signal?: AbortSignal) => {
  const url = endpoint();
  url.pathname += '/incoming';
  return parseIncorporationResponse(
    await expectOk(await fetch(url, { method: 'POST', signal })),
  );
};

export const isSupportedScope = (value: string) =>
  REVIEW_QUEUE_SCOPES.some((scope) => scope === value);
export const isSupportedRiskSignal = (value: string) =>
  REVIEW_QUEUE_RISK_SIGNALS.some((signal) => signal === value);
