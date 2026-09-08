import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppProviders } from '../../app/providers/AppProviders';
import { createAppQueryClient } from '../../app/providers/queryClient';
import { AppRouter } from '../../app/router/AppRouter';
import {
  CANONICAL_REVIEW_CASE_ID,
  canonicalReviewCaseDetails,
} from '../../mocks/data/reviewCaseDetails.fixtures';
import { server } from '../../mocks/server';
import { evidenceDestinationByRiskCode } from './lib/evidenceNavigation';
import type { RiskAssessment } from './model/reviewCase.types';

const renderWorkspace = async () => {
  render(
    <AppProviders queryClient={createAppQueryClient()}>
      <MemoryRouter
        initialEntries={[`/review-cases/${CANONICAL_REVIEW_CASE_ID}`]}
      >
        <AppRouter />
      </MemoryRouter>
    </AppProviders>,
  );

  await screen.findByRole('heading', {
    name: CANONICAL_REVIEW_CASE_ID,
    level: 1,
  });
};

describe('Review Case Workspace evidence navigation', () => {
  it('maps canonical risk signals to valid contextual links and moves focus', async () => {
    const user = userEvent.setup();
    await renderWorkspace();

    const amountLink = screen.getByRole('link', {
      name: 'View amount context',
    });
    const recipientLink = screen.getByRole('link', {
      name: 'View recipient context',
    });
    const deviceLink = screen.getByRole('link', {
      name: 'View device context',
    });

    expect(amountLink).toHaveAttribute('href', '#behavior-amount');
    expect(recipientLink).toHaveAttribute('href', '#recipient-relationship');
    expect(deviceLink).toHaveAttribute('href', '#device-context');

    await user.click(amountLink);
    expect(screen.getByLabelText('Amount context')).toHaveFocus();
    await user.click(recipientLink);
    expect(
      screen.getByRole('heading', { name: 'Recipient Relationship' }),
    ).toHaveFocus();
    await user.click(deviceLink);
    expect(
      screen.getByRole('heading', { name: 'Device Context' }),
    ).toHaveFocus();
  });

  it('uses immediate scrolling when reduced motion is requested', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    const user = userEvent.setup();
    await renderWorkspace();
    const deviceHeading = screen.getByRole('heading', {
      name: 'Device Context',
    });
    const scrollIntoView = vi.fn();
    Object.defineProperty(deviceHeading, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    vi.spyOn(deviceHeading, 'getBoundingClientRect').mockReturnValue({
      top: 1_000,
      bottom: 1_020,
    } as DOMRect);

    await user.click(screen.getByRole('link', { name: 'View device context' }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
    });
    expect(deviceHeading).toHaveFocus();
  });

  it('keeps UI destinations in the Workspace mapping, not RiskSignal data', () => {
    const signal =
      canonicalReviewCaseDetails.contexts.riskAssessment.availability ===
      'available'
        ? canonicalReviewCaseDetails.contexts.riskAssessment.data.signals[0]
        : null;

    expect(signal).not.toHaveProperty('destinationId');
    expect(evidenceDestinationByRiskCode.unusual_amount).toEqual({
      id: 'behavior-amount',
      label: 'View amount context',
    });
    expect(evidenceDestinationByRiskCode.unusual_location).toEqual({
      id: 'location-context',
      label: 'View location context',
    });
  });

  it('discloses fourth and fifth signals without duplicating the first fold', async () => {
    const risk = canonicalReviewCaseDetails.contexts.riskAssessment;
    if (risk.availability !== 'available') throw new Error('Risk unavailable');
    const fiveSignals: RiskAssessment['signals'] = [
      ...risk.data.signals,
      {
        code: 'high_velocity',
        evidenceSnapshot: {
          summary: 'Seven outgoing transfers in the last seven days',
          capturedAt: risk.data.assessedAt,
        },
      },
      {
        code: 'unusual_location',
        evidenceSnapshot: {
          summary: 'Current location differs from the established pattern',
          capturedAt: risk.data.assessedAt,
        },
      },
    ];
    server.use(
      http.get('/api/review-cases/:caseId', () =>
        HttpResponse.json({
          ...canonicalReviewCaseDetails,
          contexts: {
            ...canonicalReviewCaseDetails.contexts,
            riskAssessment: {
              ...risk,
              data: { ...risk.data, signals: fiveSignals },
            },
          },
        }),
      ),
    );
    const user = userEvent.setup();
    await renderWorkspace();

    const riskSection = screen
      .getByRole('heading', { name: 'Risk Assessment' })
      .closest('section');
    if (!riskSection) throw new Error('Risk section missing');
    const riskView = within(riskSection);
    expect(
      riskView.getByRole('heading', { name: 'Unusual amount' }),
    ).toBeVisible();
    expect(
      riskView.getByRole('heading', { name: 'New recipient' }),
    ).toBeVisible();
    expect(
      riskView.getByRole('heading', { name: 'Device change' }),
    ).toBeVisible();
    expect(
      riskView.queryByRole('heading', { name: 'High velocity' }),
    ).toBeNull();
    expect(
      riskView.queryByRole('heading', { name: 'Unusual location' }),
    ).toBeNull();

    const trigger = riskView.getByRole('button', { name: '+2 more signals' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);

    const disclosure = riskView.getByRole('group', {
      name: 'Additional risk signals',
    });
    expect(
      within(disclosure).getByRole('heading', { name: 'High velocity' }),
    ).toBeVisible();
    expect(
      within(disclosure).getByText(
        'Seven outgoing transfers in the last seven days',
      ),
    ).toBeVisible();
    expect(
      within(disclosure).getByRole('heading', { name: 'Unusual location' }),
    ).toBeVisible();
    expect(
      within(disclosure).getByText(
        'Current location differs from the established pattern',
      ),
    ).toBeVisible();
    const activityLink = within(disclosure).getByRole('link', {
      name: 'View recent activity',
    });
    expect(activityLink).toHaveAttribute('href', '#behavior-activity');
    expect(
      within(disclosure).queryByRole('link', { name: 'View location context' }),
    ).toBeNull();
    expect(
      riskView.getAllByRole('heading', { name: 'High velocity' }),
    ).toHaveLength(1);

    await user.tab();
    expect(activityLink).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(
      riskView.queryByRole('group', { name: 'Additional risk signals' }),
    ).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('does not regenerate immutable risk evidence from current Behavior values', async () => {
    const behavior = canonicalReviewCaseDetails.contexts.customerBehavior;
    if (behavior.availability !== 'available')
      throw new Error('Behavior unavailable');
    server.use(
      http.get('/api/review-cases/:caseId', () =>
        HttpResponse.json({
          ...canonicalReviewCaseDetails,
          contexts: {
            ...canonicalReviewCaseDetails.contexts,
            customerBehavior: {
              ...behavior,
              data: {
                ...behavior.data,
                amounts: { ...behavior.data.amounts, current: 999_000 },
              },
            },
          },
        }),
      ),
    );
    await renderWorkspace();

    expect(
      screen.getByText('286 000 ₽ is 6.7× above the 90-day median'),
    ).toBeVisible();
    expect(screen.getByText(/999.000 ₽/)).toBeVisible();
  });
});
