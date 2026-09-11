import { useId, useState } from 'react';
import type { Operation } from '../model/reviewCase.types';
import type {
  HistoricalTransfer,
  TransactionHistory,
} from '../model/transactionHistory.types';
import {
  amountHistoryScale,
  compactHistoryAmount,
  historyTimePosition,
} from '../lib/amountHistoryPresentation';
import {
  formatWorkspaceAmount,
  formatWorkspaceTime,
} from '../lib/workspaceFormatters';
import {
  formatHistoryDate,
  historyRelationshipLabels,
  historyStatusLabels,
} from '../lib/historyFormatters';
import styles from './TransactionHistory.module.css';

export const AmountHistory = ({
  history,
  current,
  deviation,
}: {
  history: TransactionHistory;
  current?: Operation;
  deviation?: number;
}) => {
  const id = useId();
  const events = [...history.amountSeries].reverse();
  const [activeIndex, setActiveIndex] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const active = events[activeIndex];
  const detail = events[pinned ? activeIndex : (hovered ?? activeIndex)];
  const { ceiling, offScale, ticks } = amountHistoryScale(
    history.summary,
    current?.amount,
  );
  const x = (timestamp: string) =>
    48 + historyTimePosition(timestamp, history.period) * 884;
  const y = (amount: number) => 152 - Math.min(amount / ceiling, 1) * 144;
  const money = (value: number) =>
    formatWorkspaceAmount(value, history.summary.currency);
  const eventText = (event: HistoricalTransfer) =>
    `${formatHistoryDate(event.timestamp)} ${formatWorkspaceTime(event.timestamp)} · ${money(event.amount)} · ${event.recipient.displayName} · ${historyRelationshipLabels[event.relationship]} · ${historyStatusLabels[event.status]}`;
  const range = history.summary.typicalRange;
  return (
    <div className={styles.amountHistory}>
      <h3 id={`${id}-title`}>90-Day Amount History</h3>
      <p id={`${id}-summary`} className={styles.summary}>
        {history.pageInfo.total} historical outgoing transfers in 90 days.
        Historical amounts reach {money(history.summary.historicalMaximum)}.
        {range
          ? ` Typical range ${money(range.minimum)}–${money(range.maximum)}.`
          : ''}
        {history.summary.median !== undefined
          ? ` Median ${money(history.summary.median)}.`
          : ''}
        {current
          ? ` Current held transfer ${money(current.amount)}${offScale ? ' is above the displayed historical scale.' : ' is on the displayed scale.'}`
          : ''}
      </p>
      <div
        role="listbox"
        tabIndex={0}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-summary ${id}-help`}
        aria-activedescendant={active ? `${id}-${active.id}` : undefined}
        className={styles.chart}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            setActiveIndex((index) =>
              Math.max(
                0,
                Math.min(
                  events.length - 1,
                  index + (event.key === 'ArrowRight' ? 1 : -1),
                ),
              ),
            );
            setHovered(null);
            setPinned(false);
          } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setPinned(true);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            setPinned(false);
            setHovered(null);
          }
        }}
        onMouseLeave={() => setHovered(null)}
      >
        <span id={`${id}-help`} className={styles.srOnly}>
          Left and Right explore transfers chronologically. Enter or Space pins
          details. Escape dismisses pinned details. Tab leaves the chart.
        </span>
        <svg viewBox="0 0 960 176" aria-hidden="true" focusable="false">
          {range ? (
            <rect
              className={styles.typicalBand}
              x={48}
              y={y(range.maximum)}
              width={884}
              height={y(range.minimum) - y(range.maximum)}
            />
          ) : null}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                className={styles.gridLine}
                x1={48}
                x2={932}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text x={38} y={y(tick) + 4} textAnchor="end">
                {compactHistoryAmount(tick)}
              </text>
            </g>
          ))}
          {history.summary.median !== undefined ? (
            <line
              className={styles.median}
              x1={48}
              x2={932}
              y1={y(history.summary.median)}
              y2={y(history.summary.median)}
            />
          ) : null}
          {[1, 22, 43, 64, 90].map((day) => {
            const timestamp = new Date(
              Date.parse(history.period.from) + day * 86400000,
            ).toISOString();
            return (
              <text
                key={day}
                x={x(timestamp)}
                y={173}
                textAnchor={day === 90 ? 'end' : 'start'}
              >
                {formatHistoryDate(timestamp)}
              </text>
            );
          })}
          {events.map((event, index) => (
            <g
              key={event.id}
              onMouseEnter={() => setHovered(index)}
              onClick={() => {
                setActiveIndex(index);
                setPinned(true);
              }}
            >
              <circle
                className={styles.hitArea}
                cx={x(event.timestamp)}
                cy={y(event.amount)}
                r={9}
              />
              <circle
                className={styles.historicalPoint}
                cx={x(event.timestamp)}
                cy={y(event.amount)}
                r={3.5}
              />
              {index === activeIndex ? (
                <circle
                  className={styles.activePoint}
                  cx={x(event.timestamp)}
                  cy={y(event.amount)}
                  r={6.5}
                />
              ) : null}
            </g>
          ))}
          {current ? (
            <g className={styles.currentPoint}>
              <path
                d={`M ${x(current.initiatedAt)} ${y(current.amount) - 6} l 6 6 l -6 6 l -6 -6 Z`}
              />
              <text x={x(current.initiatedAt) - 14} y={24} textAnchor="end">
                {offScale ? '↑ ' : ''}Current{' '}
                {compactHistoryAmount(current.amount)}
              </text>
              <text x={x(current.initiatedAt) - 14} y={40} textAnchor="end">
                {offScale ? 'Off scale' : 'On scale'}
                {deviation !== undefined ? ` · ×${deviation} median` : ''}
              </text>
            </g>
          ) : null}
        </svg>
        <div className={styles.srOnly}>
          {events.map((event, index) => (
            <div
              role="option"
              id={`${id}-${event.id}`}
              key={event.id}
              aria-selected={index === activeIndex}
            >
              {eventText(event)}
            </div>
          ))}
        </div>
      </div>
      <p className={styles.pointDetail} aria-live="polite">
        {detail
          ? `${pinned ? 'Pinned · ' : ''}${eventText(detail)}`
          : 'No historical transfers in this period.'}
      </p>
    </div>
  );
};
