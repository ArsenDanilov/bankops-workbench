import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRouter } from '../../app/router/AppRouter';
import styles from './ReviewQueueTable.module.css';

const LocationProbe = () => {
  const location = useLocation();
  return (
    <output aria-label="Test location">
      {location.pathname}
      {location.search}
    </output>
  );
};

const renderQueue = (entry = '/review-queue') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <AppRouter />
      <LocationProbe />
    </MemoryRouter>,
  );

const queueCaseIds = () =>
  within(screen.getByRole('table'))
    .queryAllByText(/^RC-\d{6}-\d{4}$/)
    .map((element) => element.textContent);
const currentUrl = () => screen.getByLabelText('Test location').textContent;

describe('Review Queue', () => {
  it('renders the existing semantic Queue and current pagination through the root redirect', () => {
    renderQueue('/');

    expect(screen.getByLabelText('Test location')).toHaveTextContent(
      '/review-queue',
    );
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: 'Review Queue', level: 1 }),
    ).toBeVisible();
    expect(
      screen.getByRole('searchbox', { name: 'Search review queue' }),
    ).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Refresh queue' }).tagName).toBe(
      'BUTTON',
    );
    const table = screen.getByRole('table', {
      name: 'Review cases. Fixed order by due time, then created time.',
    });
    const headers = within(table).getAllByRole('columnheader');
    expect(headers.map((header) => header.textContent?.trim())).toEqual([
      'SLA ↑',
      'Case',
      'Amount',
      'Client',
      'Recipient',
      'Risk signals',
      'Score',
    ]);
    headers.forEach((header) => expect(header).toHaveAttribute('scope', 'col'));
    expect(within(table).getAllByRole('row')).toHaveLength(11);
    expect(within(table).queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('1–10 of 10')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('searches from the accessible input and Reset restores the dataset without losing unrelated URL params', async () => {
    const user = userEvent.setup();
    renderQueue('/review-queue?view=compact');
    await user.type(
      screen.getByRole('searchbox', { name: 'Search review queue' }),
      'ЕЛЕНА',
    );
    expect(queueCaseIds()).toEqual(['RC-260902-0184']);
    expect(new URLSearchParams(currentUrl()?.split('?')[1]).get('q')).toBe(
      'ЕЛЕНА',
    );
    expect(screen.getByText('1–1 of 1')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(queueCaseIds()).toHaveLength(10);
    expect(currentUrl()).toBe('/review-queue?view=compact');
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(
      screen.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  });

  it('combines scope, SLA and risk controls and preserves accessible toggle/group state', async () => {
    const user = userEvent.setup();
    renderQueue();
    await user.click(screen.getByRole('button', { name: 'Queued' }));
    await user.click(screen.getByRole('button', { name: 'SLA breached' }));
    expect(screen.getByRole('button', { name: 'Queued' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'SLA breached' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(queueCaseIds()).toEqual(['RC-260902-0184']);
    const trigger = screen.getByRole('button', { name: 'Risk signal' });
    await user.click(trigger);
    const group = screen.getByRole('group', { name: 'Risk signal filters' });
    expect(group.tagName).toBe('FIELDSET');
    expect(trigger).toHaveAttribute('aria-controls', group.id);
    expect(within(group).getAllByRole('checkbox')).toHaveLength(5);
    await user.click(
      within(group).getByRole('checkbox', { name: 'Unusual amount' }),
    );
    await user.click(
      within(group).getByRole('checkbox', { name: 'High velocity' }),
    );
    expect(
      within(group).getByRole('checkbox', { name: 'High velocity' }),
    ).toBeChecked();
    expect(trigger).toHaveAccessibleName('Risk signal · 2');
    expect(queueCaseIds()).toEqual(['RC-260902-0184']);
    const params = new URLSearchParams(currentUrl()?.split('?')[1]);
    expect(params.getAll('risk')).toEqual(['unusual_amount', 'high_velocity']);
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('group', { name: 'Risk signal filters' }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('allows keyboard access through the Risk filter without a trap and closes it outside', async () => {
    const user = userEvent.setup();
    renderQueue();
    const trigger = screen.getByRole('button', { name: 'Risk signal' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.tab();
    expect(
      screen.getByRole('checkbox', { name: 'Unusual amount' }),
    ).toHaveFocus();
    await user.keyboard(' ');
    expect(
      screen.getByRole('checkbox', { name: 'Unusual amount' }),
    ).toBeChecked();
    for (let index = 0; index < 5; index += 1) await user.tab();
    expect(screen.getByRole('button', { name: 'Reset' })).toHaveFocus();
    await user.click(screen.getByRole('searchbox'));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('group', { name: 'Risk signal filters' }),
    ).not.toBeInTheDocument();
  });

  it('shows the current empty state and disabled pagination for the other-analyst scope', async () => {
    const user = userEvent.setup();
    renderQueue();
    await user.click(screen.getByRole('button', { name: 'Other analyst' }));
    expect(queueCaseIds()).toEqual([]);
    expect(
      screen.getByRole('cell', {
        name: 'No cases match the current search and filters.',
      }),
    ).toHaveAttribute('colspan', '7');
    expect(screen.getByText('0 of 0')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    const before = currentUrl();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(currentUrl()).toBe(before);
  });

  it.each(['999', '0', '1'])(
    'normalizes page=%s against the actual dataset while retaining other params',
    (page) => {
      renderQueue(`/review-queue?view=compact&page=${page}`);
      expect(currentUrl()).toBe('/review-queue?view=compact');
      expect(screen.getByText('1–10 of 10')).toBeVisible();
    },
  );

  it('opens hidden risk signals with the keyboard, closes on Escape and keeps focus on the native trigger', async () => {
    const user = userEvent.setup();
    renderQueue();
    const trigger = screen.getByRole('button', {
      name: 'Show 3 more risk signals for case RC-260902-0196',
    });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveTextContent('+3');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('list', {
        name: 'Additional risk signals for case RC-260902-0196',
      }),
    ).not.toBeInTheDocument();
    trigger.focus();
    await user.keyboard('{Enter}');
    const list = screen.getByRole('list', {
      name: 'Additional risk signals for case RC-260902-0196',
    });
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((element) => element.textContent),
    ).toEqual(['High velocity', 'Device change', 'Unusual location']);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      document.getElementById(trigger.getAttribute('aria-controls')!),
    ).toContainElement(list);
    await user.keyboard('{Escape}');
    expect(list).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('keeps only one row risk disclosure open, toggles it and dismisses it on outside interaction', async () => {
    const user = userEvent.setup();
    renderQueue();
    const first = screen.getByRole('button', {
      name: 'Show 1 more risk signals for case RC-260902-0184',
    });
    const second = screen.getByRole('button', {
      name: 'Show 1 more risk signals for case RC-260902-0189',
    });
    await user.click(first);
    await user.click(second);
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('list')).toHaveLength(1);
    await user.click(second);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    await user.click(first);
    await user.click(screen.getByRole('searchbox'));
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('keeps pending data stable until activation, then inserts in operational order with a temporary presentation state', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    renderQueue('/review-queue?view=compact');
    const originalIds = queueCaseIds();
    act(() => vi.advanceTimersByTime(60_000));
    expect(queueCaseIds()).toEqual(originalIds);
    expect(screen.queryByText('RC-260902-0241')).not.toBeInTheDocument();
    const before = currentUrl();
    // This test owns the clock and checks timer lifecycle with one synchronous
    // activation. The filter/incoming integration tests use real user-event clicks.
    fireEvent.click(screen.getByRole('button', { name: '1 new case' }));
    expect(queueCaseIds()).toEqual([
      'RC-260902-0184',
      'RC-260902-0189',
      'RC-260902-0241',
      'RC-260902-0196',
      'RC-260902-0201',
      'RC-260902-0207',
      'RC-260902-0212',
      'RC-260902-0219',
      'RC-260902-0225',
      'RC-260902-0231',
      'RC-260902-0237',
    ]);
    expect(currentUrl()).toBe(before);
    expect(
      screen.queryByRole('button', { name: '1 new case' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Risk signal' })).toHaveFocus();
    const row = screen.getByRole('row', { name: /RC-260902-0241/ });
    // Only the presentation flag is tested, not pixel color or animation timing.
    expect(row).toHaveClass(styles.highlightedRow);
    act(() => vi.runOnlyPendingTimers());
    expect(row).not.toHaveClass(styles.highlightedRow);
    expect(screen.getByText('1–11 of 11')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('keeps an incorporated case filtered out until controls allow it, without rewriting the URL', async () => {
    const user = userEvent.setup();
    renderQueue(
      '/review-queue?scope=my_reviews&risk=new_recipient&view=compact',
    );
    expect(queueCaseIds()).toEqual(['RC-260902-0207']);
    const before = currentUrl();
    await user.click(screen.getByRole('button', { name: '1 new case' }));
    expect(queueCaseIds()).toEqual(['RC-260902-0207']);
    expect(currentUrl()).toBe(before);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(queueCaseIds()).toHaveLength(11);
    expect(screen.getByText('RC-260902-0241')).toBeVisible();
  });

  it('includes an incoming case that matches the active search without clearing that search', async () => {
    const user = userEvent.setup();
    renderQueue('/review-queue?q=Лазарева');
    expect(screen.getByText('0 of 0')).toBeVisible();
    const before = currentUrl();
    await user.click(screen.getByRole('button', { name: '1 new case' }));
    expect(queueCaseIds()).toEqual(['RC-260902-0241']);
    expect(screen.getByRole('searchbox')).toHaveValue('Лазарева');
    expect(currentUrl()).toBe(before);
    expect(screen.getByText('1–1 of 1')).toBeVisible();
  });
});
