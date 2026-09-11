import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { canonicalTransactionHistory as history } from '../../../mocks/data/transactionHistory.fixtures';
import { canonicalReviewCaseDetails as details } from '../../../mocks/data/reviewCaseDetails.fixtures';
import {
  amountHistoryScale,
  historyTimePosition,
} from '../lib/amountHistoryPresentation';
import { AmountHistory } from './AmountHistory';

describe('Amount History presentation and keyboard exploration', () => {
  it('derives a canonical 100k ceiling and preserves historical scale for extreme current', () => {
    expect(amountHistoryScale(history.summary, 286000)).toEqual({
      ceiling: 100000,
      offScale: true,
      ticks: [0, 25000, 50000, 75000, 100000],
    });
    expect(amountHistoryScale(history.summary, 115000)).toMatchObject({
      ceiling: 125000,
      offScale: false,
    });
    expect(
      amountHistoryScale({ currency: 'RUB', historicalMaximum: 310000 }, 40000)
        .ceiling,
    ).toBe(400000);
    expect(
      amountHistoryScale({
        currency: 'RUB',
        historicalMaximum: 5000,
        typicalRange: { minimum: 1000, maximum: 8000 },
      }).ceiling,
    ).toBe(8000);
    expect(historyTimePosition(history.period.to, history.period)).toBe(1);
    expect(historyTimePosition(history.period.from, history.period)).toBe(0);
  });

  it('uses authoritative references even when event amounts would yield a different median', () => {
    const custom = {
      ...history,
      summary: {
        ...history.summary,
        median: 39000,
        typicalRange: { minimum: 17000, maximum: 87000 },
      },
    };
    render(
      <AmountHistory
        history={custom}
        current={details.contexts.operation.data.operation}
        deviation={6.7}
      />,
    );
    expect(screen.getByText(/Median 39.000 ₽/)).toBeVisible();
    expect(screen.getByText(/Typical range 17.000 ₽–87.000 ₽/)).toBeVisible();
    expect(
      screen.getByText(/is above the displayed historical scale/),
    ).toBeVisible();
    expect(screen.getByText(/Off scale · ×6.7 median/)).toBeInTheDocument();
    const chart = screen.getByRole('listbox');
    expect(chart.querySelectorAll('circle')).not.toHaveLength(0);
    expect(chart.querySelector('path')).not.toBeNull();
  });

  it('has one Tab entry, chronological arrows, keyboard-pinned details and no focus trap', async () => {
    const user = userEvent.setup();
    render(
      <>
        <AmountHistory
          history={history}
          current={details.contexts.operation.data.operation}
        />
        <button>After chart</button>
      </>,
    );
    const chart = screen.getByRole('listbox');
    expect(within(chart).getAllByRole('option')).toHaveLength(46);
    expect(chart.querySelectorAll('[tabindex="0"]')).toHaveLength(0);
    await user.tab();
    expect(chart).toHaveFocus();
    expect(
      within(chart).getByRole('option', { selected: true }),
    ).toHaveTextContent('10 Jun 09:10');
    await user.keyboard('{ArrowRight}');
    expect(
      within(chart).getByRole('option', { selected: true }),
    ).toHaveTextContent('12 Jun 01:46');
    await user.keyboard('{Enter}');
    expect(screen.getByText(/^Pinned ·/)).toHaveTextContent('71');
    await user.keyboard('{Escape}');
    expect(screen.queryByText(/^Pinned ·/)).toBeNull();
    await user.keyboard('{ArrowLeft} ');
    expect(screen.getByText(/^Pinned ·/)).toHaveTextContent('10 Jun');
    await user.tab();
    expect(screen.getByRole('button', { name: 'After chart' })).toHaveFocus();
  });

  it('omits absent baseline layers without inventing an error for limited history', () => {
    render(
      <AmountHistory
        history={{
          ...history,
          summary: { currency: 'RUB', historicalMaximum: 94000 },
          amountSeries: history.amountSeries.slice(0, 4),
          pageInfo: { limit: 10, total: 4 },
        }}
      />,
    );
    expect(
      screen.getByText(/4 historical outgoing transfers in 90 days/),
    ).toBeVisible();
    expect(screen.queryByText(/Typical range|Median/)).toBeNull();
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });
});
