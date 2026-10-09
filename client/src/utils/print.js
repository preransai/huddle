// client/src/utils/print.js — the "print run" of a post: which ink its second plate and tack are
// printed in, where the tack sits, how far the plate is skewed and how its photos are taped.
// Deterministic per post id, so a post looks the same in the feed, on the profile and on /post/:id.

const RUNS = [
  { ink: 'blue', plate: 'plate-blue', tack: 'bg-riso-blue' },
  { ink: 'pink', plate: 'plate-pink', tack: 'bg-riso-pink' },
  { ink: 'yellow', plate: 'plate-yellow', tack: 'bg-riso-yellow' },
];
const SKEW = [-0.35, -0.2, 0.2, 0.35]; // deg
const TAPES = ['tl', 'tr', 'top', 'pair'];

// FNV-1a over the whole id, then murmur3's fmix32 finaliser. Mongo ObjectIds of posts created
// together differ only in their last hex digits; without the finaliser neighbours collide.
export function hashId(id = '') {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0; // unsigned, so every >>> below stays non-negative
}

export function printRun(id = '') {
  const h = hashId(id);
  const r = h % 10; // weighted 40 / 40 / 20: yellow is the quietest ink on the light board
  return {
    ...RUNS[r < 4 ? 0 : r < 8 ? 1 : 2],
    tackX: (((h >>> 8) % 5) - 2) * 14, // -28, -14, 0, 14, 28 px
    plateR: SKEW[(h >>> 24) % 4],
    tape: TAPES[(h >>> 16) % 4], // ImageGrid maps 'pair' to 'tl' when there is one photo
  };
}
