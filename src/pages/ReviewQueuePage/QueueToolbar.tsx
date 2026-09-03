import { useRef, useState } from 'react';
import { reviewQueueRiskSignalOptions } from './lib/reviewQueueFormatters';
import type { ReviewQueueRiskSignal } from './model/reviewQueue.types';
import type {
  ReviewQueueScope,
  ReviewQueueSearchState,
} from './model/reviewQueueSearchParams.types';
import styles from './ReviewQueuePage.module.css';

interface QueueToolbarProps {
  state: ReviewQueueSearchState;
  hasActiveQuery: boolean;
  onSearchChange: (search: string) => void;
  onScopeToggle: (scope: ReviewQueueScope) => void;
  onSlaBreachedToggle: () => void;
  onRiskSignalToggle: (riskSignal: ReviewQueueRiskSignal) => void;
  onReset: () => void;
  hasPendingIncomingCase: boolean;
  onIncorporateIncomingCase: () => void;
}

const filterButtonClassName = (isActive: boolean) =>
  `${styles.filterButton} ${isActive ? styles.filterButtonActive : ''}`;

export const QueueToolbar = ({
  state,
  hasActiveQuery,
  onSearchChange,
  onScopeToggle,
  onSlaBreachedToggle,
  onRiskSignalToggle,
  onReset,
  hasPendingIncomingCase,
  onIncorporateIncomingCase,
}: QueueToolbarProps) => {
  const [isRiskPanelOpen, setIsRiskPanelOpen] = useState(false);
  const riskTriggerRef = useRef<HTMLButtonElement>(null);
  const riskPanelId = 'review-queue-risk-filter-panel';

  return (
    <section
      className={styles.toolbar}
      aria-label="Review queue controls"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isRiskPanelOpen) {
          setIsRiskPanelOpen(false);
        }
      }}
    >
      <div className={styles.searchField}>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20">
          <path d="M8.7 3.3a5.4 5.4 0 1 0 0 10.8 5.3 5.3 0 0 0 3.3-1.2l3.5 3.6 1-1-3.6-3.5a5.4 5.4 0 0 0-4.2-8.7Zm-4 5.4a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
        </svg>
        <input
          className={styles.searchInput}
          type="search"
          value={state.search}
          placeholder="Search case, operation, client, recipient"
          aria-label="Search review queue"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <button
        className={filterButtonClassName(state.scopes.includes('queued'))}
        type="button"
        aria-pressed={state.scopes.includes('queued')}
        onClick={() => onScopeToggle('queued')}
      >
        Queued
      </button>
      <button
        className={filterButtonClassName(state.scopes.includes('my_reviews'))}
        type="button"
        aria-pressed={state.scopes.includes('my_reviews')}
        onClick={() => onScopeToggle('my_reviews')}
      >
        My reviews
      </button>
      <button
        className={filterButtonClassName(
          state.scopes.includes('other_analyst'),
        )}
        type="button"
        aria-pressed={state.scopes.includes('other_analyst')}
        onClick={() => onScopeToggle('other_analyst')}
      >
        Other analyst
      </button>
      <button
        className={filterButtonClassName(state.slaBreached)}
        type="button"
        aria-pressed={state.slaBreached}
        onClick={onSlaBreachedToggle}
      >
        SLA breached
      </button>

      <div className={styles.riskFilter}>
        <button
          className={filterButtonClassName(state.riskSignals.length > 0)}
          type="button"
          ref={riskTriggerRef}
          aria-expanded={isRiskPanelOpen}
          aria-controls={riskPanelId}
          onClick={() => setIsRiskPanelOpen((isOpen) => !isOpen)}
        >
          <span>
            Risk signal
            {state.riskSignals.length > 0
              ? ` · ${state.riskSignals.length}`
              : ''}
          </span>
          <svg
            className={isRiskPanelOpen ? styles.riskChevronOpen : undefined}
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 16 16"
          >
            <path d="m4.2 6 3.8 4 3.8-4H4.2Z" />
          </svg>
        </button>

        {isRiskPanelOpen ? (
          <div
            className={styles.riskPanel}
            id={riskPanelId}
            aria-label="Risk signal filters"
          >
            {reviewQueueRiskSignalOptions.map(({ value, label }) => (
              <label className={styles.riskOption} key={value}>
                <input
                  type="checkbox"
                  checked={state.riskSignals.includes(value)}
                  onChange={() => onRiskSignalToggle(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        ) : null}
      </div>

      {hasActiveQuery ? (
        <button className={styles.resetButton} type="button" onClick={onReset}>
          Reset
        </button>
      ) : null}

      {hasPendingIncomingCase ? (
        <button
          className={styles.incomingUpdateButton}
          type="button"
          onClick={() => {
            onIncorporateIncomingCase();
            riskTriggerRef.current?.focus();
          }}
        >
          1 new case
        </button>
      ) : null}
    </section>
  );
};
