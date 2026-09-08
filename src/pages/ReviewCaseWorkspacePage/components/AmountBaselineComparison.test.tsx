import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createAmountBaselinePresentation } from '../lib/amountBaselinePresentation';
import { AmountBaselineComparison } from './AmountBaselineComparison';

describe('amount baseline presentation', () => {
  it('positions a current amount linearly inside the typical range', () => {
    const result = createAmountBaselinePresentation(50, 40, 20, 80);

    expect(result.currentPosition).toBeCloseTo(41.67, 2);
    expect(result.rangeStartPosition).toBeCloseTo(16.67, 2);
    expect(result.rangeEndPosition).toBeCloseTo(66.67, 2);
    expect(result.isOffScale).toBe(false);
  });

  it('uses the limited extension for a moderate amount above range', () => {
    const result = createAmountBaselinePresentation(100, 40, 20, 80);

    expect(result.currentPosition).toBeCloseTo(83.33, 2);
    expect(result.isOffScale).toBe(false);
  });

  it('caps an extreme amount at the lane edge and marks it off scale', () => {
    const result = createAmountBaselinePresentation(
      286_000,
      42_600,
      18_000,
      86_000,
    );

    expect(result.currentPosition).toBe(100);
    expect(result.isOffScale).toBe(true);
  });

  it('keeps authoritative values textual and the lane free of fraud semantics', () => {
    render(
      <AmountBaselineComparison
        isActive={false}
        amounts={{
          currency: 'RUB',
          current: 286_000,
          median90d: 42_600,
          typicalRange: { minimum: 18_000, maximum: 86_000 },
          deviationMultiplier: 6.7,
        }}
      />,
    );

    expect(screen.getByText(/286.000 ₽/)).toBeVisible();
    expect(screen.getByText(/42.600 ₽/)).toBeVisible();
    expect(screen.getByText(/18.000 ₽–86.000 ₽/)).toBeVisible();
    expect(screen.getByText('×6.7')).toBeVisible();
    expect(screen.getByText('Off scale')).toBeVisible();
    expect(screen.queryByText(/fraud|probability|severity/i)).toBeNull();
  });
});
