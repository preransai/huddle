// Kept in sync with client/src/utils/text.js so what the server indexes is
// exactly what the client renders as a link.
const HASHTAG_RE = /(?<![\w#])#([a-zA-Z][a-zA-Z0-9_]{0,49})/g;
const MENTION_RE = /(?<![\w@])@([a-zA-Z][a-zA-Z0-9_]{2,19})/g;

function unique(values) {
  return [...new Set(values)];
}

function extractHashtags(text = '') {
  return unique([...text.matchAll(HASHTAG_RE)].map((m) => m[1].toLowerCase()));
}

function extractMentions(text = '') {
  return unique([...text.matchAll(MENTION_RE)].map((m) => m[1].toLowerCase()));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { extractHashtags, extractMentions, escapeRegex };
