import { describe, expect, it } from 'vitest';
import { compactNumber, displayUrl, pluralize } from './format';

describe('format helpers', () => {
  it('compacts large numbers', () => {
    expect(compactNumber(999)).toBe('999');
    expect(compactNumber(1200)).toBe('1.2K');
    expect(compactNumber(2_500_000)).toBe('2.5M');
  });

  it('pluralizes with the count', () => {
    expect(pluralize(1, 'post')).toBe('1 post');
    expect(pluralize(3, 'post')).toBe('3 posts');
    expect(pluralize(2, 'reply', 'replies')).toBe('2 replies');
  });

  it('strips the protocol and trailing slash from links', () => {
    expect(displayUrl('https://ananya.dev/')).toBe('ananya.dev');
  });
});
