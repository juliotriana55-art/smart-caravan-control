import { parseSourceSeconds } from './iso-time.mjs';
const cases = [
  [1700000000, 1700000000],
  [1700000000000, 1700000000],
  ['2026-10-20T12:30:00+11:00', 1792459800],
  ['2026-10-20T01:30:00', null]
];
for (const [input, expected] of cases) {
  if (parseSourceSeconds(input) !== expected) {
    throw new Error('Timestamp parser regression');
  }
}
