import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppProviders } from '../../app/providers/AppProviders';
import { createAppQueryClient } from '../../app/providers/queryClient';
import { AppRouter } from '../../app/router/AppRouter';
import { canonicalReviewCaseDetails as details } from '../../mocks/data/reviewCaseDetails.fixtures';
import {
  canonicalTransactionHistory as history,
  readTransactionHistoryPage,
} from '../../mocks/data/transactionHistory.fixtures';
import { server } from '../../mocks/server';

const endpoint = '/api/review-cases/:caseId/transaction-history';
const renderWorkspace = () =>
  render(
    <AppProviders queryClient={createAppQueryClient()}>
      <MemoryRouter initialEntries={[`/review-cases/${details.case.id}`]}>
        <AppRouter />
      </MemoryRouter>
    </AppProviders>,
  );
const loadedTable = async () => {
  await screen.findByText('Showing 10 of 46');
  return screen.getByRole('table');
};

describe('Transaction History section', () => {
  it('keeps a semantic five-column table, separate current reference and reaches all 46 rows by appending', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    const table = await loadedTable();
    expect(table).toHaveAccessibleName(
      /historical outgoing transfers.*90-day.*newest first.*current held transfer shown separately/i,
    );
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((e) => e.textContent),
    ).toEqual(['Date / time', 'Amount', 'Recipient', 'Relationship', 'Status']);
    expect(within(table).getAllByRole('row')).toHaveLength(11);
    const first = within(table).getAllByRole('row')[1];
    const current = screen.getByRole('group', {
      name: 'Current held transfer',
    });
    expect(table.contains(current)).toBe(false);
    expect(
      within(current).getByText('Not part of historical activity'),
    ).toBeVisible();
    expect(within(current).getByText('Held')).toBeVisible();
    expect(within(table).queryByText(/286.000/)).toBeNull();
    for (const count of [20, 30, 40, 46]) {
      await user.click(
        screen.getByRole('button', { name: 'Load older transfers' }),
      );
      await screen.findByText(
        count === 46
          ? 'All 46 historical transfers shown'
          : `Showing ${count} of 46`,
      );
      expect(within(table).getAllByRole('row')).toHaveLength(count + 1);
      expect(within(table).getAllByRole('row')[1]).toBe(first);
    }
    expect(
      screen.queryByRole('button', { name: 'Load older transfers' }),
    ).toBeNull();
    expect(
      [...table.querySelectorAll('tbody time')].map((e) =>
        e.getAttribute('datetime'),
      ),
    ).toEqual(history.amountSeries.map((e) => e.timestamp));
  });

  it('keeps first fold and current visible while History independently loads', async () => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.get(endpoint, async () => {
        await pending;
        return HttpResponse.json(history);
      }),
    );
    renderWorkspace();
    await screen.findByRole('status', { name: 'Loading transaction history' });
    expect(
      screen.getByRole('heading', { name: 'Risk Assessment' }),
    ).toBeVisible();
    expect(
      screen.getByRole('group', { name: 'Current held transfer' }),
    ).toBeVisible();
    expect(screen.queryByRole('listbox')).toBeNull();
    release();
    await loadedTable();
  });

  it('locally retries a transport failure without removing first-fold evidence', async () => {
    let requests = 0;
    server.use(
      http.get(endpoint, () => {
        requests++;
        return requests <= 2
          ? HttpResponse.json({}, { status: 503 })
          : HttpResponse.json(history);
      }),
    );
    const user = userEvent.setup();
    renderWorkspace();
    await screen.findByText('Couldn’t load transaction history');
    expect(
      screen.getByRole('heading', { name: 'Customer Behavior' }),
    ).toBeVisible();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByRole('listbox')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await loadedTable();
    expect(requests).toBe(3);
  });

  it('does not request server-authoritative unavailable evidence or offer a meaningless retry', async () => {
    const request = vi.fn(() => HttpResponse.json(history));
    server.use(
      http.get(endpoint, request),
      http.get('/api/review-cases/:caseId', () =>
        HttpResponse.json({
          ...details,
          contexts: {
            ...details.contexts,
            transactionHistory: {
              requirement: 'required',
              availability: 'unavailable',
              reason: 'source_unavailable',
            },
          },
        }),
      ),
    );
    renderWorkspace();
    await screen.findByText('Transaction history unavailable');
    expect(request).not.toHaveBeenCalled();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    expect(screen.getByText('Required context')).toBeVisible();
  });

  it('renders four-event successful evidence without Load older or a reliability heuristic', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          ...history,
          items: history.items.slice(0, 4),
          amountSeries: history.amountSeries.slice(0, 4),
          summary: { currency: 'RUB', historicalMaximum: 63000 },
          pageInfo: { total: 4, limit: 10 },
        }),
      ),
    );
    renderWorkspace();
    await screen.findByText('All 4 historical transfers shown');
    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
      5,
    );
    expect(
      screen.queryByRole('button', { name: 'Load older transfers' }),
    ).toBeNull();
  });

  it('retains rows during next-page pending/error and retries the same page', async () => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    let olderRequests = 0;
    server.use(
      http.get(endpoint, async ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        if (cursor) {
          olderRequests++;
          if (olderRequests <= 2) {
            await pending;
            return HttpResponse.json({}, { status: 503 });
          }
        }
        return HttpResponse.json(
          readTransactionHistoryPage(10, cursor ?? undefined),
        );
      }),
    );
    const user = userEvent.setup();
    renderWorkspace();
    const table = await loadedTable();
    const first = within(table).getAllByRole('row')[1];
    await user.click(
      screen.getByRole('button', { name: 'Load older transfers' }),
    );
    expect(
      screen.getByRole('button', { name: 'Loading older transfers…' }),
    ).toBeDisabled();
    expect(within(table).getAllByRole('row')).toHaveLength(11);
    release();
    await screen.findByText('Couldn’t load older transfers. Try again.');
    expect(within(table).getAllByRole('row')[1]).toBe(first);
    await user.click(
      screen.getByRole('button', { name: 'Load older transfers' }),
    );
    await screen.findByText('Showing 20 of 46');
    expect(olderRequests).toBe(3);
  });

  it('continues Behavior to History using W3 focus and reduced-motion scrolling', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await loadedTable();
    const heading = screen.getByRole('heading', {
      name: 'Transaction History',
    });
    const scroll = vi.fn();
    Object.defineProperty(heading, 'scrollIntoView', {
      configurable: true,
      value: scroll,
    });
    vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
      top: 1200,
      bottom: 1220,
    } as DOMRect);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    await user.click(
      screen.getByRole('link', { name: 'Review 90-day transaction history' }),
    );
    await waitFor(() => expect(heading).toHaveFocus());
    expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    expect(
      screen.getByRole('link', { name: 'View amount context' }),
    ).toHaveAttribute('href', '#behavior-amount');
  });
});
