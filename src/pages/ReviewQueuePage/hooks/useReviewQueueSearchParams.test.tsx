import { act, renderHook } from '@testing-library/react';
import {
  MemoryRouter,
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useReviewQueueSearchParams } from './useReviewQueueSearchParams';

const renderState = (entry = '/review-queue') =>
  renderHook(
    () => ({
      ...useReviewQueueSearchParams(),
      location: useLocation(),
      navigate: useNavigate(),
      navigationType: useNavigationType(),
    }),
    {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/previous', entry]}>
          {children}
        </MemoryRouter>
      ),
    },
  );

describe('URL-owned Queue controls', () => {
  it.each(['search', 'scope', 'sla', 'risk'] as const)(
    '%s changes reset page while preserving other controls',
    (control) => {
      const { result } = renderState(
        '/review-queue?q=Elena&scope=queued&sla=breached&risk=high_velocity&page=3&view=compact',
      );
      expect(result.current.state.page).toBe(3);
      const actions = {
        search: () => result.current.setSearch('New search'),
        scope: () => result.current.toggleScope('my_reviews'),
        sla: () => result.current.toggleSlaBreached(),
        risk: () => result.current.toggleRiskSignal('new_recipient'),
      };
      act(actions[control]);
      expect(result.current.state).toEqual({
        search: control === 'search' ? 'New search' : 'Elena',
        scopes: control === 'scope' ? ['queued', 'my_reviews'] : ['queued'],
        slaBreached: control !== 'sla',
        riskSignals:
          control === 'risk'
            ? ['new_recipient', 'high_velocity']
            : ['high_velocity'],
        page: 1,
      });
      const params = new URLSearchParams(result.current.location.search);
      expect(params.has('page')).toBe(false);
      expect(params.get('view')).toBe('compact');
      expect(result.current.navigationType).toBe(
        control === 'search' ? 'REPLACE' : 'PUSH',
      );
    },
  );

  it('toggles selected scope/risk off and Reset removes only Queue params', () => {
    const { result } = renderState(
      '/review-queue?scope=queued&risk=high_velocity&view=compact',
    );
    act(() => result.current.toggleScope('queued'));
    act(() => result.current.toggleRiskSignal('high_velocity'));
    expect(result.current.hasActiveQuery).toBe(false);
    expect(result.current.location.search).toBe('?view=compact');
    act(() => result.current.setSearch('Elena'));
    act(() => result.current.setPage(2));
    expect(result.current.hasActiveQuery).toBe(true);
    act(() => result.current.reset());
    expect(result.current.location.search).toBe('?view=compact');
    expect(result.current.state.page).toBe(1);
    expect(result.current.hasActiveQuery).toBe(false);
  });

  it('serializes page changes without losing filters and omits page one', () => {
    const { result } = renderState('/review-queue?scope=queued&view=compact');
    act(() => result.current.setPage(2));
    expect(result.current.location.search).toBe(
      '?view=compact&scope=queued&page=2',
    );
    expect(result.current.navigationType).toBe('PUSH');
    act(() => result.current.setPage(1, true));
    expect(result.current.location.search).toBe('?view=compact&scope=queued');
    expect(result.current.navigationType).toBe('REPLACE');
  });

  it('replaces typing history but pushes filter history, restoring controls on Back/Forward', () => {
    const { result } = renderState();
    act(() => result.current.setSearch('E'));
    act(() => result.current.setSearch('Elena'));
    act(() => result.current.toggleSlaBreached());
    act(() => result.current.navigate(-1));
    expect(result.current.state.search).toBe('Elena');
    expect(result.current.state.slaBreached).toBe(false);
    act(() => result.current.navigate(-1));
    expect(result.current.location.pathname).toBe('/previous');
    act(() => result.current.navigate(2));
    expect(result.current.location.pathname).toBe('/review-queue');
    expect(result.current.state.search).toBe('Elena');
    expect(result.current.state.slaBreached).toBe(true);
  });
});
