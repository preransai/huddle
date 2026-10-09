import { describe, expect, it } from 'vitest';
import { initials, tokenize } from './text';

describe('tokenize', () => {
  it('splits text into plain text, hashtags and mentions', () => {
    expect(tokenize('Demo day with @Priya #Hackathon!')).toEqual([
      { type: 'text', value: 'Demo day with ' },
      { type: 'mention', value: '@Priya', username: 'priya' },
      { type: 'text', value: ' ' },
      { type: 'hashtag', value: '#Hackathon', tag: 'hackathon' },
      { type: 'text', value: '!' },
    ]);
  });

  it('does not treat email addresses as mentions', () => {
    const tokens = tokenize('mail me at ananya@example.com');
    expect(tokens.filter((t) => t.type === 'mention')).toHaveLength(0);
  });

  it('ignores # in the middle of a word and hashtags starting with a digit', () => {
    const tokens = tokenize('C# is fine, issue #42 is not a tag');
    expect(tokens.filter((t) => t.type === 'hashtag')).toHaveLength(0);
  });

  it('detects links and leaves trailing punctuation out of them', () => {
    const tokens = tokenize('Slides: https://example.com/talk.');
    expect(tokens[1]).toEqual({ type: 'link', value: 'https://example.com/talk', href: 'https://example.com/talk' });
    expect(tokens[2]).toEqual({ type: 'text', value: '.' });
  });

  it('ignores mentions shorter than a valid username', () => {
    expect(tokenize('hi @ab').map((t) => t.type)).toEqual(['text']);
  });

  it('returns no tokens for empty text', () => {
    expect(tokenize('')).toEqual([]);
  });
});

describe('initials', () => {
  it('uses the first and last name', () => {
    expect(initials('Kabir Malhotra')).toBe('KM');
    expect(initials('Sofia Garcia Martinez')).toBe('SM');
  });

  it('handles single names and blanks', () => {
    expect(initials('kabir')).toBe('K');
    expect(initials('   ')).toBe('?');
  });
});
