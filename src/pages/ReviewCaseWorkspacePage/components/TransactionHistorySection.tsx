import { useInfiniteQuery } from '@tanstack/react-query';
import type {
  ReviewCaseDetails,
  OperationCurrency,
} from '../model/reviewCase.types';
import type { HistoricalTransfer } from '../model/transactionHistory.types';
import { transactionHistoryQueryOptions } from '../api/transactionHistoryQuery';
import {
  formatWorkspaceAmount,
  formatWorkspaceTime,
} from '../lib/workspaceFormatters';
import {
  formatHistoryDate,
  historyRelationshipLabels,
  historyStatusLabels,
} from '../lib/historyFormatters';
import { OverflowTooltipText } from '../../ReviewQueuePage/OverflowTooltipText';
import { AmountHistory } from './AmountHistory';
import workspace from '../ReviewCaseWorkspacePage.module.css';
import styles from './TransactionHistory.module.css';

const columns = [
  'Date / time',
  'Amount',
  'Recipient',
  'Relationship',
  'Status',
];

const HistoryTable = ({
  items,
  currency,
  loading = false,
}: {
  items: HistoricalTransfer[];
  currency: OperationCurrency;
  loading?: boolean;
}) => (
  <table className={styles.table} aria-busy={loading}>
    <caption>
      <strong>Historical transfers</strong>
      <span className={styles.srOnly}>
        {' '}
        — historical outgoing transfers in the 90-day evidence period, newest
        first; current held transfer shown separately.
      </span>
    </caption>
    <colgroup>
      {[148, 128, 340, 220, 124].map((width) => (
        <col key={width} style={{ width }} />
      ))}
    </colgroup>
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column} scope="col">
            {column}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {loading
        ? Array.from({ length: 10 }, (_, i) => (
            <tr key={i} aria-hidden="true">
              {columns.map((column) => (
                <td key={column}>
                  <span className={styles.skeletonLine} />
                </td>
              ))}
            </tr>
          ))
        : items.map((item) => (
            <tr key={item.id} data-recipient-id={item.recipient.id}>
              <td>
                <time dateTime={item.timestamp}>
                  {formatHistoryDate(item.timestamp)}
                  <span>{formatWorkspaceTime(item.timestamp)}</span>
                </time>
              </td>
              <td>{formatWorkspaceAmount(item.amount, currency)}</td>
              <td>
                <OverflowTooltipText text={item.recipient.displayName} />
              </td>
              <td>{historyRelationshipLabels[item.relationship]}</td>
              <td>{historyStatusLabels[item.status]}</td>
            </tr>
          ))}
    </tbody>
  </table>
);

const CurrentHeldTransfer = ({ details }: { details: ReviewCaseDetails }) => {
  const context = details.contexts.operation;
  if (
    context.availability !== 'available' ||
    context.data.operation.status !== 'held'
  )
    return null;
  const { operation, recipient } = context.data;
  const relationship = details.contexts.recipientRelationship;
  return (
    <div
      className={styles.currentReference}
      role="group"
      aria-label="Current held transfer"
    >
      <div className={styles.currentLabel}>
        <strong>Current held transfer</strong>
        <span>Not part of historical activity</span>
      </div>
      <div className={styles.currentRow}>
        <time dateTime={operation.initiatedAt}>
          {formatHistoryDate(operation.initiatedAt)} ·{' '}
          {formatWorkspaceTime(operation.initiatedAt)}
        </time>
        <strong>
          {formatWorkspaceAmount(operation.amount, operation.currency)}
        </strong>
        <OverflowTooltipText text={recipient.displayName} />
        <span>
          {relationship.availability === 'available'
            ? relationship.data.relationship === 'new'
              ? 'New recipient'
              : 'Known recipient'
            : 'Relationship unavailable'}
        </span>
        <span>Held</span>
      </div>
    </div>
  );
};

export const TransactionHistorySection = ({
  details,
  isActive,
}: {
  details: ReviewCaseDetails;
  isActive: boolean;
}) => {
  const descriptor = details.contexts.transactionHistory;
  const available = descriptor.availability === 'available';
  const query = useInfiniteQuery({
    ...transactionHistoryQueryOptions(
      details.case.id,
      available ? descriptor.data.sourceSnapshotId : '',
    ),
    enabled: available,
  });
  const history = query.data?.pages[0];
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const operation = details.contexts.operation;
  const behavior = details.contexts.customerBehavior;
  return (
    <section className={styles.section} aria-labelledby="transaction-history">
      <header className={styles.heading}>
        <h2
          id="transaction-history"
          tabIndex={-1}
          className={`${workspace.sectionTitle} ${workspace.evidenceTarget} ${isActive ? workspace.evidenceTargetActive : ''}`}
        >
          Transaction History
        </h2>
        {available && history ? (
          <p>
            {history.pageInfo.total} historical outgoing transfers · 90 days
          </p>
        ) : (
          <p>{available ? '90-day evidence period' : 'Required context'}</p>
        )}
      </header>
      {!available ? (
        <div className={styles.localState}>
          <h3>Transaction history unavailable</h3>
          <p>
            The evidence snapshot reports required transaction history as
            unavailable for this case.
          </p>
        </div>
      ) : (
        <>
          {history ? (
            <AmountHistory
              key={`${history.caseId}-${history.sourceSnapshotId}`}
              history={history}
              current={
                operation.availability === 'available'
                  ? operation.data.operation
                  : undefined
              }
              deviation={
                behavior.availability === 'available'
                  ? behavior.data.amounts.deviationMultiplier
                  : undefined
              }
            />
          ) : query.isError ? (
            <div className={styles.localState} role="alert">
              <h3>Couldn’t load transaction history</h3>
              <p>Historical transaction data could not be retrieved.</p>
              <button
                className={workspace.retryButton}
                onClick={() => void query.refetch()}
                disabled={query.isFetching}
              >
                {query.isFetching ? 'Retrying…' : 'Retry'}
              </button>
            </div>
          ) : (
            <div
              className={styles.chartSkeleton}
              role="status"
              aria-label="Loading transaction history"
            >
              <span className={styles.skeletonLine} />
              <span className={styles.skeletonPlot} />
            </div>
          )}
          <CurrentHeldTransfer details={details} />
          {history || !query.isError ? (
            <HistoryTable
              items={items}
              currency={history?.summary.currency ?? 'RUB'}
              loading={!history}
            />
          ) : null}
          {history ? (
            <div className={styles.footer}>
              <span role="status">
                {!query.hasNextPage
                  ? `All ${items.length} historical transfers shown`
                  : `Showing ${items.length} of ${history.pageInfo.total}`}
              </span>
              {query.isFetchNextPageError ? (
                <span role="alert">
                  Couldn’t load older transfers. Try again.
                </span>
              ) : null}
              {query.hasNextPage ? (
                <button
                  className={workspace.retryButton}
                  disabled={query.isFetching}
                  onClick={() => {
                    if (!query.isFetching) void query.fetchNextPage();
                  }}
                >
                  {query.isFetchingNextPage
                    ? 'Loading older transfers…'
                    : 'Load older transfers'}
                </button>
              ) : null}
            </div>
          ) : !query.isError ? (
            <div className={styles.footer} />
          ) : null}
        </>
      )}
    </section>
  );
};
