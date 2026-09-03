import { useSearchParams } from 'react-router-dom';
import {
  clearReviewQueueSearchParams,
  createReviewQueueSearchParams,
  parseReviewQueueSearchParams,
} from '../lib/reviewQueueSearchParams';
import type { ReviewQueueRiskSignal } from '../model/reviewQueue.types';
import type {
  ReviewQueueScope,
  ReviewQueueSearchState,
} from '../model/reviewQueueSearchParams.types';

type StateUpdate = (
  currentState: ReviewQueueSearchState,
) => ReviewQueueSearchState;

export const useReviewQueueSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, pageParamNeedsNormalization } =
    parseReviewQueueSearchParams(searchParams);

  const updateState = (update: StateUpdate, replace = false) => {
    setSearchParams(
      createReviewQueueSearchParams(searchParams, update(state)),
      { replace },
    );
  };

  const setSearch = (search: string) => {
    updateState((currentState) => ({ ...currentState, search, page: 1 }), true);
  };

  const toggleScope = (scope: ReviewQueueScope) => {
    updateState((currentState) => ({
      ...currentState,
      scopes: currentState.scopes.includes(scope)
        ? currentState.scopes.filter((value) => value !== scope)
        : [...currentState.scopes, scope],
      page: 1,
    }));
  };

  const toggleSlaBreached = () => {
    updateState((currentState) => ({
      ...currentState,
      slaBreached: !currentState.slaBreached,
      page: 1,
    }));
  };

  const toggleRiskSignal = (riskSignal: ReviewQueueRiskSignal) => {
    updateState((currentState) => ({
      ...currentState,
      riskSignals: currentState.riskSignals.includes(riskSignal)
        ? currentState.riskSignals.filter((value) => value !== riskSignal)
        : [...currentState.riskSignals, riskSignal],
      page: 1,
    }));
  };

  const setPage = (page: number, replace = false) => {
    updateState((currentState) => ({ ...currentState, page }), replace);
  };

  const reset = () => {
    setSearchParams(clearReviewQueueSearchParams(searchParams));
  };

  const hasActiveQuery =
    Boolean(state.search.trim()) ||
    state.scopes.length > 0 ||
    state.slaBreached ||
    state.riskSignals.length > 0 ||
    state.page !== 1;

  return {
    state,
    pageParamNeedsNormalization,
    hasActiveQuery,
    setSearch,
    toggleScope,
    toggleSlaBreached,
    toggleRiskSignal,
    setPage,
    reset,
  };
};
