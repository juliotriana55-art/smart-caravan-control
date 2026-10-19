import { parseSourceSeconds } from './iso-time.mjs';
export const normalizeStamp = value => parseSourceSeconds(value);
