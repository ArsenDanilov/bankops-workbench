import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '../../app/providers/AppProviders';
import { createAppQueryClient } from '../../app/providers/queryClient';
import { AppRouter } from '../../app/router/AppRouter';
import { server } from '../../mocks/server';

const renderQueue = () =>
  render(
    <AppProviders queryClient={createAppQueryClient()}>
      <MemoryRouter initialEntries={['/review-queue']}>
        <AppRouter />
      </MemoryRouter>
    </AppProviders>,
  );

describe('Review Queue asynchronous server state', () => {
  it('shows the geometry-matched skeleton only while uncached data loads', async () => {
    server.use(
      http.get('/api/review-cases', async () => {
        await delay(50);
        return HttpResponse.json({
          items: [],
          total: 0,
          page: 1,
          pageSize: 25,
          updatedAt: '2026-09-02T10:24:00.000Z',
          pendingCount: 0,
        });
      }),
    );
    renderQueue();
    const region = screen.getByRole('region', { name: 'Review queue results' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(within(region).getAllByRole('row', { hidden: true })).toHaveLength(
      10,
    );
    await waitFor(() => expect(region).toHaveAttribute('aria-busy', 'false'));
    expect(
      screen.getByText('No cases match the current search and filters.'),
    ).toBeVisible();
  });

  it('distinguishes a request error from an empty result and Retry performs a real request', async () => {
    server.use(
      http.get(
        '/api/review-cases',
        () => HttpResponse.json({ message: 'temporary' }, { status: 503 }),
        { once: true },
      ),
    );
    const user = userEvent.setup();
    renderQueue();
    expect(
      await screen.findByText('Queue data could not be loaded.'),
    ).toBeVisible();
    expect(
      screen.queryByText('No cases match the current search and filters.'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('RC-260902-0184')).toBeVisible();
    expect(
      screen.queryByText('Queue data could not be loaded.'),
    ).not.toBeInTheDocument();
  });

  it('keeps data visible during Refresh and exposes restrained updating state', async () => {
    const user = userEvent.setup();
    renderQueue();
    expect(await screen.findByText('RC-260902-0184')).toBeVisible();
    expect(screen.getByText('Updated 13:24')).toBeVisible();
    server.use(
      http.get('/api/review-cases', async ({ request }) => {
        await delay(50);
        const url = new URL(request.url);
        expect(url.searchParams.get('pageSize')).toBe('25');
        return HttpResponse.json({
          items: [],
          total: 0,
          page: 1,
          pageSize: 25,
          updatedAt: '2026-09-02T10:25:00.000Z',
          pendingCount: 0,
        });
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Refresh queue' }));
    expect(screen.getByText('RC-260902-0184')).toBeVisible();
    expect(screen.getByText('Updating…')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Refresh queue' }),
    ).toBeDisabled();
    expect(await screen.findByText('Updated 13:25')).toBeVisible();
    expect(
      screen.getByText('No cases match the current search and filters.'),
    ).toBeVisible();
  });
});
