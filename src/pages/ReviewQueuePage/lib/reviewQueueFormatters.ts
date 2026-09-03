import type {
  ReviewQueueCurrency,
  ReviewQueueItem,
  ReviewQueueLifecycle,
  ReviewQueueRiskSignal,
} from '../model/reviewQueue.types';

const SLA_REFERENCE_MINUTES = 13 * 60 + 24;

const amountFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
  useGrouping: true,
});

const currencyLabels: Record<ReviewQueueCurrency, string> = {
  RUB: '₽',
  EUR: 'EUR',
  USD: 'USD',
};

const lifecycleLabels: Record<ReviewQueueLifecycle, string> = {
  queued: 'Queued',
  in_review: 'In review',
};

const riskSignalLabels: Record<ReviewQueueRiskSignal, string> = {
  unusual_amount: 'Unusual amount',
  new_recipient: 'New recipient',
  high_velocity: 'High velocity',
  device_change: 'Device change',
  unusual_location: 'Unusual location',
};

export const formatQueueTime = (timestamp: string) => timestamp.slice(11, 16);

export const formatQueueAmount = (
  amount: number,
  currency: ReviewQueueCurrency,
) => `${amountFormatter.format(amount)} ${currencyLabels[currency]}`;

export const formatLifecycle = (lifecycle: ReviewQueueLifecycle) =>
  lifecycleLabels[lifecycle];

export const formatRiskSignal = (signal: ReviewQueueRiskSignal) =>
  riskSignalLabels[signal];

export const formatSlaPrimary = ({
  dueAt,
  slaState,
}: Pick<ReviewQueueItem, 'dueAt' | 'slaState'>) => {
  const dueHours = Number(dueAt.slice(11, 13));
  const dueMinutes = Number(dueAt.slice(14, 16));
  const difference = dueHours * 60 + dueMinutes - SLA_REFERENCE_MINUTES;

  if (slaState === 'breached') {
    return `Breached ${Math.abs(difference)} min`;
  }

  return `${Math.max(0, difference)} min left`;
};
