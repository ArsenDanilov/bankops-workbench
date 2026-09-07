import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '../../app/providers/AppProviders';
import { createAppQueryClient } from '../../app/providers/queryClient';
import { AppRouter } from '../../app/router/AppRouter';
import {
  CANONICAL_REVIEW_CASE_ID,
  canonicalReviewCaseDetails,
} from '../../mocks/data/reviewCaseDetails.fixtures';
import { server } from '../../mocks/server';

const NavigateToSecondCase = () => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => void navigate('/review-cases/RC-260907-0315')}
    >
      Open second case
    </button>
  );
};

const renderRoute = (
  entry = `/review-cases/${CANONICAL_REVIEW_CASE_ID}`,
  withNavigation = false,
) =>
  render(
    <AppProviders queryClient={createAppQueryClient()}>
      <MemoryRouter initialEntries={[entry]}>
        <AppRouter />
        {withNavigation ? <NavigateToSecondCase /> : null}
      </MemoryRouter>
    </AppProviders>,
  );

describe('Review Case Workspace route and query states', () => {
  it('deep-links to the case ID and renders the minimal successful projection', async () => {
    renderRoute();
    expect(
      await screen.findByRole('heading', {
        name: `Case ${CANONICAL_REVIEW_CASE_ID}`,
        level: 1,
      }),
    ).toBeVisible();
    expect(screen.getByText('In review')).toBeVisible();
    expect(screen.getByText('Current analyst')).toBeVisible();
    expect(screen.getByText(/286.000 RUB/)).toBeVisible();
    expect(screen.getByText('Score 78 · 3 signals')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Back to Review Queue' }),
    ).toHaveAttribute('href', '/review-queue');
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('shows a real loading state before delayed details arrive', async () => {
    server.use(
      http.get('/api/review-cases/:caseId', async () => {
        await delay(50);
        return HttpResponse.json(canonicalReviewCaseDetails);
      }),
    );
    renderRoute();
    expect(
      screen.getByRole('heading', { name: 'Loading review case…' }),
    ).toBeVisible();
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(
      await screen.findByRole('heading', {
        name: `Case ${CANONICAL_REVIEW_CASE_ID}`,
      }),
    ).toBeVisible();
  });

  it('renders a distinct not-found state without retrying a 404', async () => {
    let requests = 0;
    server.use(
      http.get('/api/review-cases/:caseId', () => {
        requests += 1;
        return HttpResponse.json({ message: 'not found' }, { status: 404 });
      }),
    );
    renderRoute('/review-cases/RC-UNKNOWN');
    expect(
      await screen.findByRole('heading', { name: 'Review case not found' }),
    ).toBeVisible();
    expect(
      screen.getByText('No review case exists for ID RC-UNKNOWN.'),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Retry' }),
    ).not.toBeInTheDocument();
    expect(requests).toBe(1);
  });

  it('shows a generic error after a bounded retry and Retry performs a real refetch', async () => {
    let requests = 0;
    server.use(
      http.get('/api/review-cases/:caseId', () => {
        requests += 1;
        if (requests <= 2)
          return HttpResponse.json({ message: 'temporary' }, { status: 503 });
        return HttpResponse.json(canonicalReviewCaseDetails);
      }),
    );
    const user = userEvent.setup();
    renderRoute();
    expect(
      await screen.findByRole('heading', {
        name: 'Review case could not be loaded',
      }),
    ).toBeVisible();
    expect(requests).toBe(2);
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(
      await screen.findByRole('heading', {
        name: `Case ${CANONICAL_REVIEW_CASE_ID}`,
      }),
    ).toBeVisible();
    expect(requests).toBe(3);
  });

  it('uses the next route parameter and query key when navigating to another case', async () => {
    const secondCase = {
      ...canonicalReviewCaseDetails,
      case: {
        ...canonicalReviewCaseDetails.case,
        id: 'RC-260907-0315',
        operationId: 'OP-260907-0719',
      },
      contexts: {
        ...canonicalReviewCaseDetails.contexts,
        operation: {
          ...canonicalReviewCaseDetails.contexts.operation,
          data: {
            ...canonicalReviewCaseDetails.contexts.operation.data,
            operation: {
              ...canonicalReviewCaseDetails.contexts.operation.data.operation,
              id: 'OP-260907-0719',
              amount: 125_000,
            },
          },
        },
      },
    };
    const requestedIds: string[] = [];
    server.use(
      http.get('/api/review-cases/:caseId', ({ params }) => {
        const caseId = String(params.caseId);
        requestedIds.push(caseId);
        return HttpResponse.json(
          caseId === secondCase.case.id
            ? secondCase
            : canonicalReviewCaseDetails,
        );
      }),
    );
    const user = userEvent.setup();
    renderRoute(undefined, true);
    expect(
      await screen.findByRole('heading', {
        name: `Case ${CANONICAL_REVIEW_CASE_ID}`,
      }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Open second case' }));
    expect(
      await screen.findByRole('heading', { name: 'Case RC-260907-0315' }),
    ).toBeVisible();
    expect(screen.getByText(/125.000 RUB/)).toBeVisible();
    await waitFor(() =>
      expect(requestedIds).toEqual([
        CANONICAL_REVIEW_CASE_ID,
        'RC-260907-0315',
      ]),
    );
  });
});
