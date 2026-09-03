import {
  REVIEW_QUEUE_RISK_SIGNALS,
  type ReviewQueueRiskSignal,
} from '../model/reviewQueue.types';
import {
  REVIEW_QUEUE_SCOPES,
  type ParsedReviewQueueSearchState,
  type ReviewQueueScope,
  type ReviewQueueSearchState,
} from '../model/reviewQueueSearchParams.types';

const REVIEW_QUEUE_PARAM_NAMES = ['q', 'scope', 'sla', 'risk', 'page'] as const;

const isOneOf = <Value extends string>(
  value: string,
  allowedValues: readonly Value[],
): value is Value =>
  allowedValues.some((allowedValue) => allowedValue === value);

const uniqueAllowedValues = <Value extends string>(
  values: readonly string[],
  allowedValues: readonly Value[],
) =>
  allowedValues.filter((allowedValue) =>
    values.some((value) => value === allowedValue),
  );

const parsePage = (rawPage: string | null) => {
  if (rawPage === null || !/^[1-9]\d*$/.test(rawPage)) {
    return 1;
  }

  const page = Number(rawPage);
  return Number.isSafeInteger(page) ? page : 1;
};

export const isReviewQueueScope = (value: string): value is ReviewQueueScope =>
  isOneOf(value, REVIEW_QUEUE_SCOPES);

export const isReviewQueueRiskSignal = (
  value: string,
): value is ReviewQueueRiskSignal => isOneOf(value, REVIEW_QUEUE_RISK_SIGNALS);

export const parseReviewQueueSearchParams = (
  searchParams: URLSearchParams,
): ParsedReviewQueueSearchState => {
  const rawPage = searchParams.get('page');
  const page = parsePage(rawPage);

  return {
    state: {
      search: searchParams.get('q') ?? '',
      scopes: uniqueAllowedValues(
        searchParams.getAll('scope').filter(isReviewQueueScope),
        REVIEW_QUEUE_SCOPES,
      ),
      slaBreached: searchParams.get('sla') === 'breached',
      riskSignals: uniqueAllowedValues(
        searchParams.getAll('risk').filter(isReviewQueueRiskSignal),
        REVIEW_QUEUE_RISK_SIGNALS,
      ),
      page,
    },
    pageParamNeedsNormalization:
      rawPage !== null && (page === 1 || rawPage !== String(page)),
  };
};

export const createReviewQueueSearchParams = (
  currentSearchParams: URLSearchParams,
  state: ReviewQueueSearchState,
) => {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  REVIEW_QUEUE_PARAM_NAMES.forEach((name) => nextSearchParams.delete(name));

  if (state.search.trim()) {
    nextSearchParams.set('q', state.search);
  }

  REVIEW_QUEUE_SCOPES.forEach((scope) => {
    if (state.scopes.includes(scope)) {
      nextSearchParams.append('scope', scope);
    }
  });

  if (state.slaBreached) {
    nextSearchParams.set('sla', 'breached');
  }

  REVIEW_QUEUE_RISK_SIGNALS.forEach((riskSignal) => {
    if (state.riskSignals.includes(riskSignal)) {
      nextSearchParams.append('risk', riskSignal);
    }
  });

  if (state.page > 1) {
    nextSearchParams.set('page', String(state.page));
  }

  return nextSearchParams;
};

export const clearReviewQueueSearchParams = (
  currentSearchParams: URLSearchParams,
) => {
  const nextSearchParams = new URLSearchParams(currentSearchParams);
  REVIEW_QUEUE_PARAM_NAMES.forEach((name) => nextSearchParams.delete(name));
  return nextSearchParams;
};
