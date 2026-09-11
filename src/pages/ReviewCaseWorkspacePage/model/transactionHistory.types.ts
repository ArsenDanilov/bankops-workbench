import type { OperationCurrency } from './reviewCase.types';

export interface HistoricalTransfer {
  id: string;
  timestamp: string;
  amount: number;
  recipient: { id: string; displayName: string };
  relationship: 'known' | 'first_transfer';
  status: 'completed' | 'failed' | 'cancelled';
}

export interface TransactionHistory {
  caseId: string;
  sourceSnapshotId: string;
  asOf: string;
  period: { days: 90; from: string; to: string };
  summary: {
    currency: OperationCurrency;
    historicalMaximum: number;
    median?: number;
    typicalRange?: { minimum: number; maximum: number };
  };
  // Complete bounded event series, independent of the detailed page.
  amountSeries: HistoricalTransfer[];
  items: HistoricalTransfer[];
  pageInfo: {
    limit: number;
    cursor?: string;
    nextCursor?: string;
    total: number;
  };
}
