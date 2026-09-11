const date = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  timeZone: 'Europe/Moscow',
});
export const formatHistoryDate = (timestamp: string) =>
  date.format(new Date(timestamp)).replace('Sept', 'Sep');
export const historyRelationshipLabels = {
  known: 'Known recipient',
  first_transfer: 'First transfer',
} as const;
export const historyStatusLabels = {
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
} as const;
