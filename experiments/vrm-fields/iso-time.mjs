// Experimental time parsing helper. Not wired into production.
export function parseSourceSeconds(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1e11 ? value / 1000 : value;
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    return numeric > 1e11 ? numeric / 1000 : numeric;
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(trimmed)) return null;
  const ms = Date.parse(trimmed);
  return Number.isFinite(ms) ? ms / 1000 : null;
}
