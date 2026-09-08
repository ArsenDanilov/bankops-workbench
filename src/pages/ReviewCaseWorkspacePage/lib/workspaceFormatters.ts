import type {
  OperationCurrency,
  OperationStatus,
  ReviewCaseLifecycle,
  ReviewCaseRiskCode,
} from '../model/reviewCase.types';

const amountFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/Moscow',
});

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Europe/Moscow',
});

const currencySymbols: Record<OperationCurrency, string> = {
  RUB: '₽',
  EUR: '€',
  USD: '$',
};

export const formatWorkspaceAmount = (
  amount: number,
  currency: OperationCurrency,
) => `${amountFormatter.format(amount)} ${currencySymbols[currency]}`;

export const formatWorkspaceTime = (value: string) =>
  timeFormatter.format(new Date(value));

export const isSameWorkspaceDay = (left: string, right: string) =>
  dateFormatter.format(new Date(left)) ===
  dateFormatter.format(new Date(right));

export const lifecycleLabels: Record<ReviewCaseLifecycle, string> = {
  queued: 'Queued',
  in_review: 'In review',
  resolved: 'Resolved',
  invalidated: 'Invalidated',
};

export const operationStatusLabels: Record<OperationStatus, string> = {
  held: 'held',
  processing: 'processing',
  completed: 'completed',
  declined: 'declined',
};

export const riskSignalLabels: Record<ReviewCaseRiskCode, string> = {
  unusual_amount: 'Unusual amount',
  new_recipient: 'New recipient',
  high_velocity: 'High velocity',
  device_change: 'Device change',
  unusual_location: 'Unusual location',
};
