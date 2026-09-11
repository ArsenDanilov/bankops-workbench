import type { TransactionHistory } from '../model/transactionHistory.types';

const readableCeiling = (maximum: number) => {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(1, maximum)));
  const normalized = Math.max(1, maximum) / magnitude;
  const tick =
    [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(
      (value) => value >= normalized,
    ) ?? 10;
  return tick * magnitude;
};

export const amountHistoryScale = (
  summary: TransactionHistory['summary'],
  current?: number,
) => {
  const historicalCeiling = readableCeiling(
    Math.max(summary.historicalMaximum, summary.typicalRange?.maximum ?? 0),
  );
  const offScale = current !== undefined && current > historicalCeiling * 1.25;
  const ceiling =
    current !== undefined && !offScale
      ? readableCeiling(Math.max(historicalCeiling, current))
      : historicalCeiling;
  return {
    ceiling,
    offScale,
    ticks: [0, 1, 2, 3, 4].map((i) => (ceiling * i) / 4),
  };
};

export const historyTimePosition = (
  timestamp: string,
  period: TransactionHistory['period'],
) =>
  (Date.parse(timestamp) - Date.parse(period.from)) /
  (Date.parse(period.to) - Date.parse(period.from));

export const compactHistoryAmount = (amount: number) =>
  amount >= 1000 ? `${Number((amount / 1000).toFixed(2))}k` : String(amount);
