import { parseSourceSeconds } from './iso-time.mjs';
import { extractFreshSnapshot } from './parser.mjs';
export const normalizeStamp = value => parseSourceSeconds(value);
export function extractNormalizedSnapshot(diag, options = {}) {
  const records = Array.isArray(diag?.records) ? diag.records : [];
  const normalized = records.map(record => ({
    ...record,
    timestamp: normalizeStamp(record?.timestamp) ?? undefined
  }));
  return extractFreshSnapshot({ ...(diag ?? {}), records: normalized }, options);
}
