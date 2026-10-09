// client/src/utils/print.test.js (vitest)
import { describe, expect, it } from 'vitest';
import { hashId, printRun } from './print';

// 24 consecutive ids from the seeded feed (GET /api/posts/feed, 2026-10-08)
const SEEDED = [
  '6ac728be24dde8b3c58d2e31', '6ac728be24dde8b3c58d2e35', '6ac728be24dde8b3c58d2e3b', '6ac728be24dde8b3c58d2e3d',
  '6ac728be24dde8b3c58d2e41', '6ac728be24dde8b3c58d2e44', '6ac728be24dde8b3c58d2e45', '6ac728be24dde8b3c58d2e4a',
  '6ac728be24dde8b3c58d2e4d', '6ac728be24dde8b3c58d2e53', '6ac728be24dde8b3c58d2e57', '6ac728be24dde8b3c58d2e59',
  '6ac728be24dde8b3c58d2e5d', '6ac728be24dde8b3c58d2e5f', '6ac728be24dde8b3c58d2e64', '6ac728be24dde8b3c58d2e67',
  '6ac728be24dde8b3c58d2e68', '6ac728be24dde8b3c58d2e6b', '6ac728be24dde8b3c58d2e6c', '6ac728be24dde8b3c58d2e73',
  '6ac728be24dde8b3c58d2e75', '6ac728be24dde8b3c58d2e76', '6ac728be24dde8b3c58d2e78', '6ac728be24dde8b3c58d2e7d'];

describe('printRun', () => {
  it('is deterministic', () => {
    expect(printRun('6ac728be24dde8b3c58d2e31')).toEqual(printRun('6ac728be24dde8b3c58d2e31'));
  });
  it('stays inside the allowed values, including empty and odd ids', () => {
    for (const id of [...SEEDED, '', 'x', 'ffffffffffffffffffffffff', '\u{1F600}']) {
      const r = printRun(id);
      expect([-28, -14, 0, 14, 28]).toContain(r.tackX);
      expect([-0.35, -0.2, 0.2, 0.35]).toContain(r.plateR);
      expect(['tl', 'tr', 'top', 'pair']).toContain(r.tape);
      expect(['plate-blue', 'plate-pink', 'plate-yellow']).toContain(r.plate);
      expect(hashId(id)).toBeGreaterThanOrEqual(0);
    }
  });
  it('uses all three inks across the seeded feed', () => {
    expect(new Set(SEEDED.map((id) => printRun(id).ink)).size).toBe(3);
  });
  it('does not pin neighbouring posts at the same spot (v1 did, 47% of the time)', () => {
    const runs = SEEDED.map(printRun);
    const same = runs.slice(1).filter((r, i) => r.tackX === runs[i].tackX).length;
    expect(same / (runs.length - 1)).toBeLessThan(0.3);
  });
});
