const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function compactNumber(value = 0) {
  return value < 1000 ? String(value) : compactFormatter.format(value);
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${compactNumber(count)} ${count === 1 ? singular : plural}`;
}

export function displayUrl(url = '') {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
