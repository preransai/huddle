const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

// Compact form for post headers: "now", "5m", "3h", "2d", then a date.
export function shortTime(date, now = new Date()) {
  const then = new Date(date);
  const seconds = Math.round((now - then) / 1000);

  if (seconds < 45) return 'now';
  if (seconds < HOUR) return `${Math.max(1, Math.round(seconds / MINUTE))}m`;
  if (seconds < DAY) return `${Math.round(seconds / HOUR)}h`;
  if (seconds < WEEK) return `${Math.round(seconds / DAY)}d`;

  const sameYear = then.getFullYear() === now.getFullYear();
  return then.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

// Longer form for notifications and comments: "just now", "3 hours ago", "yesterday".
export function relativeTime(date, now = new Date()) {
  const seconds = Math.round((new Date(date) - now) / 1000);
  const abs = Math.abs(seconds);

  if (abs < 45) return 'just now';
  if (abs < HOUR) return rtf.format(Math.round(seconds / MINUTE), 'minute');
  if (abs < DAY) return rtf.format(Math.round(seconds / HOUR), 'hour');
  if (abs < WEEK) return rtf.format(Math.round(seconds / DAY), 'day');
  if (abs < 5 * WEEK) return rtf.format(Math.round(seconds / WEEK), 'week');
  return rtf.format(Math.round(seconds / (30 * DAY)), 'month');
}

export function fullDate(date) {
  return new Date(date).toLocaleString('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function joinedDate(date) {
  return new Date(date).toLocaleDateString('en', { month: 'long', year: 'numeric' });
}
