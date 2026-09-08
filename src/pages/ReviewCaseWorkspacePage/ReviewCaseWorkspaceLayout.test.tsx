import { render, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '../../app/providers/AppProviders';
import { createAppQueryClient } from '../../app/providers/queryClient';
import { AppRouter } from '../../app/router/AppRouter';
import {
  CANONICAL_REVIEW_CASE_ID,
  canonicalReviewCaseDetails,
} from '../../mocks/data/reviewCaseDetails.fixtures';
import { server } from '../../mocks/server';

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
  return screen.findByRole('heading', {
    name: CANONICAL_REVIEW_CASE_ID,
    level: 1,
  });
};

const sectionForHeading = (name: string) => {
  const section = screen.getByRole('heading', { name }).closest('section');
  if (!section) throw new Error(`No section for ${name}`);
  return within(section);
};

describe('Review Case Workspace first-fold composition', () => {
  it('renders the canonical orientation and all first-fold evidence sections', async () => {
    await renderWorkspace();

    expect(screen.getByText('In review')).toBeVisible();
    expect(screen.getByText('You')).toBeVisible();
    expect(screen.getByText('11 min left')).toBeVisible();
    expect(screen.getByText('Due 13:42')).toBeVisible();
    expect(screen.getByText(/Outgoing transfer · 286.000 ₽/)).toBeVisible();
    expect(screen.getByText('Operation held')).toBeVisible();

    const operation = sectionForHeading('Operation');
    expect(operation.getByText(/286.000 ₽/)).toBeVisible();
    expect(operation.getByText('Initiated 13:06')).toBeVisible();
    expect(operation.getByText('Александра Виноградова')).toBeVisible();
    expect(operation.getByText('•••• 4382')).toBeVisible();
    expect(operation.getByText('Михаил Андреевич Сафронов')).toBeVisible();
    expect(operation.getByText('•••• 9127')).toBeVisible();
    expect(operation.getByText('Возврат долга')).toBeVisible();

    const risk = sectionForHeading('Risk Assessment');
    expect(risk.getByText('Score 78 · Assessed 13:08')).toBeVisible();
    expect(risk.getByRole('heading', { name: 'Unusual amount' })).toBeVisible();
    expect(risk.getByRole('heading', { name: 'New recipient' })).toBeVisible();
    expect(risk.getByRole('heading', { name: 'Device change' })).toBeVisible();
    expect(
      risk.getByText('286 000 ₽ is 6.7× above the 90-day median'),
    ).toBeVisible();
    expect(risk.getByText('No previous successful transfers')).toBeVisible();
    expect(risk.getByText('Current device was first seen today')).toBeVisible();

    const behavior = sectionForHeading('Customer Behavior');
    expect(behavior.getByText(/42.600 ₽/)).toBeVisible();
    expect(behavior.getByText(/18.000 ₽–86.000 ₽/)).toBeVisible();
    expect(behavior.getByText('×6.7')).toBeVisible();
    expect(behavior.getByText('1 / 24h · 7 / 7d')).toBeVisible();
    expect(behavior.getByText('3–5 / week')).toBeVisible();

    const recipient = sectionForHeading('Recipient Relationship');
    expect(recipient.getByText('New recipient')).toBeVisible();
    expect(recipient.getByText('Previous transfers')).toBeVisible();
    expect(recipient.getByText('0')).toBeVisible();
    expect(recipient.getByText('Today')).toBeVisible();
    expect(recipient.getByText('No historical amount baseline')).toBeVisible();

    const device = sectionForHeading('Device Context');
    expect(
      device.getByText(/Windows 11 · Chrome · first seen today/),
    ).toBeVisible();
    expect(
      device.getByText(/iPhone 15 · recent\/primary device pattern/),
    ).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: 'Location' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Transaction History' }),
    ).toBeVisible();
  });

  it('keeps domain concepts separate and the Decision Rail non-actionable', async () => {
    await renderWorkspace();

    const rail = screen.getByRole('complementary', { name: 'Decision' });
    expect(within(rail).getByText(CANONICAL_REVIEW_CASE_ID)).toBeVisible();
    expect(within(rail).getByText(/286.000 ₽/)).toBeVisible();
    expect(within(rail).getByText(/→ Михаил Андреевич Сафронов/)).toBeVisible();
    expect(within(rail).getByText('Unusual amount')).toBeVisible();
    expect(within(rail).getByText('New recipient')).toBeVisible();
    expect(within(rail).getByText('Device change')).toBeVisible();
    expect(within(rail).getByText('Ready for decision')).toBeVisible();

    expect(screen.getByText('In review')).toBeVisible();
    expect(screen.getByText('Operation held')).toBeVisible();
    expect(
      screen.queryByText(/probability|likelihood/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /release/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /block/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('removes the conditional strip when Device is not relevant', async () => {
    server.use(
      http.get('/api/review-cases/:caseId', () =>
        HttpResponse.json({
          ...canonicalReviewCaseDetails,
          contexts: {
            ...canonicalReviewCaseDetails.contexts,
            device: {
              requirement: 'not_relevant',
              availability: 'not_applicable',
            },
          },
        }),
      ),
    );
    await renderWorkspace();

    expect(
      screen.queryByRole('heading', { name: 'Device Context' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Transaction History' }),
    ).toBeVisible();
  });
});
