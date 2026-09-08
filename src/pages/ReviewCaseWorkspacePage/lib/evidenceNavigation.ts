import type { ReviewCaseRiskCode } from '../model/reviewCase.types';

export type EvidenceDestinationId =
  | 'behavior-amount'
  | 'behavior-activity'
  | 'recipient-relationship'
  | 'device-context'
  | 'location-context';

interface EvidenceDestination {
  id: EvidenceDestinationId;
  label: string;
}

export const evidenceDestinationByRiskCode: Record<
  ReviewCaseRiskCode,
  EvidenceDestination
> = {
  unusual_amount: { id: 'behavior-amount', label: 'View amount context' },
  new_recipient: {
    id: 'recipient-relationship',
    label: 'View recipient context',
  },
  high_velocity: { id: 'behavior-activity', label: 'View recent activity' },
  device_change: { id: 'device-context', label: 'View device context' },
  unusual_location: { id: 'location-context', label: 'View location context' },
};

export const getRenderedEvidenceDestination = (
  riskCode: ReviewCaseRiskCode,
  renderedDestinationIds: ReadonlySet<EvidenceDestinationId>,
) => {
  const destination = evidenceDestinationByRiskCode[riskCode];
  return renderedDestinationIds.has(destination.id) ? destination : null;
};
