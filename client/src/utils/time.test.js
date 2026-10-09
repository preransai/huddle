import { describe, expect, it } from 'vitest';
import { relativeTime, shortTime } from './time';

const now = new Date('2026-03-15T12:00:00Z');
const ago = (seconds) => new Date(now.getTime() - seconds * 1000);

describe('shortTime', () => {
  it.each([
    [10, 'now'],
    [60, '1m'],
    [59 * 60, '59m'],
    [3 * 3600, '3h'],
    [2 * 86400, '2d'],
  ])('%i seconds ago is "%s"', (seconds, expected) => {
    expect(shortTime(ago(seconds), now)).toBe(expected);
  });

  it('switches to a date after a week', () => {
    expect(shortTime(ago(10 * 86400), now)).toBe('Mar 5');
  });

  it('includes the year for dates in another year', () => {
    expect(shortTime(new Date('2025-12-20T12:00:00Z'), now)).toBe('Dec 20, 2025');
  });
});

describe('relativeTime', () => {
  it.each([
    [5, 'just now'],
    [5 * 60, '5 minutes ago'],
    [3600, '1 hour ago'],
    [86400, 'yesterday'],
    [3 * 86400, '3 days ago'],
    [14 * 86400, '2 weeks ago'],
  ])('%i seconds ago is "%s"', (seconds, expected) => {
    expect(relativeTime(ago(seconds), now)).toBe(expected);
  });
});
