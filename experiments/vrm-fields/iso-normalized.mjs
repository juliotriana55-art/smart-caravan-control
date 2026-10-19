export const normalizeStamp = value => typeof value === 'string' ? Date.parse(value) : value;
