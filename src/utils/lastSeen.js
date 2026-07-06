import { formatRelativeTime } from '@/utils/formatters';

export const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

export function parseTimestamp(value) {
  if (!value) return null;

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatLastSeen(value) {
  const date = parseTimestamp(value);
  if (!date) return 'Never';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < ONLINE_THRESHOLD_MS) return 'Online';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfSeenDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (startOfSeenDay.getTime() === startOfYesterday.getTime()) {
    return 'Yesterday';
  }

  return formatRelativeTime(date.toISOString());
}

export function isUserOnline(value) {
  const date = parseTimestamp(value);
  if (!date) return false;
  return Date.now() - date.getTime() < ONLINE_THRESHOLD_MS;
}
