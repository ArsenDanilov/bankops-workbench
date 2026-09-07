import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { reviewQueueFixtures } from './model/reviewQueue.fixtures';
import { ReviewQueueTable } from './ReviewQueueTable';

it('marks the results busy during the static skeleton and restores accessible data when ready', () => {
  const { rerender } = render(
    <ReviewQueueTable items={[]} presentationState="loading" />,
  );
  const region = screen.getByRole('region', { name: 'Review queue results' });
  const table = screen.getByRole('table');
  expect(region).toHaveAttribute('aria-busy', 'true');
  expect(within(table).getAllByRole('row')).toHaveLength(1);
  expect(within(table).getAllByRole('row', { hidden: true })).toHaveLength(10);
  expect(within(table).queryByRole('button')).not.toBeInTheDocument();

  rerender(<ReviewQueueTable items={[reviewQueueFixtures[0]]} />);
  expect(region).toHaveAttribute('aria-busy', 'false');
  expect(within(table).getAllByRole('row')).toHaveLength(2);
  expect(within(table).getByText('RC-260902-0184')).toBeVisible();
});
