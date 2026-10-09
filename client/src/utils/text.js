// Same patterns the server uses to index hashtags and mentions, plus links.
// The lookbehinds stop "email@domain.com" from turning into a mention and
// "C#" or "a#b" from turning into a hashtag.
const TOKEN_RE =
  /(?<![\w#])#([a-zA-Z][a-zA-Z0-9_]{0,49})|(?<![\w@])@([a-zA-Z][a-zA-Z0-9_]{2,19})|(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?])/g;

export function tokenize(text = '') {
  const tokens = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TOKEN_RE)) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const [value, tag, username, url] = match;
    if (tag) tokens.push({ type: 'hashtag', value, tag: tag.toLowerCase() });
    else if (username) tokens.push({ type: 'mention', value, username: username.toLowerCase() });
    else tokens.push({ type: 'link', value, href: url });
    lastIndex = match.index + value.length;
  }

  if (lastIndex < text.length) tokens.push({ type: 'text', value: text.slice(lastIndex) });
  return tokens;
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
