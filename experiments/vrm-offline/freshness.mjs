/**
 * Pure VRM telemetry status logic for Smart Caravan Control's Monday pilot.
 * No network, no secrets, no Worker calls. Use after a separately authenticated fetch.
 */
export const MAX_FRESH_AGE_MS = 15 * 60 * 1000;
export const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;
export const METRIC_KEYS = Object.freeze(['soc', 'voltage', 'current', 'solarWatts', 'dcPower', 'waterPct']);
export const VALID_INVERTER = Object.freeze(['on', 'off']);

export function sanitizeMetrics(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const cleaned = {};
  for (const key of METRIC_KEYS) {
    cleaned[key] = typeof data[key] === 'number' && Number.isFinite(data[key]) ? data[key] : null;
  }
  cleaned.inverter = VALID_INVERTER.includes(data.inverter) ? data.inverter : null;
  return Object.values(cleaned).some(value => value !== null) ? cleaned : null;
}

/**
 * A transport failure ALWAYS takes precedence over a recent-looking timestamp.
 * This avoids calling last-known values 'live' when the Cerbo/VRM is unreachable.
 */
export function assessReading({ mode = 'vrm', data = null, updated = null, transportOk = false, now = Date.now() } = {}) {
  if (mode === 'demo') return { status: 'demo', ageMs: null, isLive: false };
  if (!sanitizeMetrics(data)) return { status: transportOk ? 'waiting' : 'error', ageMs: null, isLive: false };
  const timestamp = typeof updated === 'string' ? Date.parse(updated) : NaN;
  const validTimestamp = Number.isFinite(timestamp) && timestamp <= now + MAX_FUTURE_SKEW_MS;
  const ageMs = validTimestamp ? Math.max(0, now - timestamp) : null;
  if (!transportOk) return { status: 'offline', ageMs, isLive: false };
  if (ageMs === null) return { status: 'unknown', ageMs: null, isLive: false };
  return { status: ageMs <= MAX_FRESH_AGE_MS ? 'fresh' : 'stale', ageMs, isLive: false };
}

/**
 * Create a locally storable snapshot from a verified VRM response.
 * The object contains only telemetry, source timestamp, and an installation
 * scope; it never includes an access key, token, or authentication header.
 */
export function snapshotFromVerifiedResponse(response, checkedAt = Date.now()) {
  if (!response || response.source !== 'vrm' || response.readOnly !== true) return null;
  const installationId = String(response.installationId ?? '');
  if (!/^\d+$/.test(installationId)) return null;
  const data = sanitizeMetrics(response.data);
  if (!data) return null;
  const updated = typeof response.updated === 'string' && Number.isFinite(Date.parse(response.updated))
    ? response.updated : null;
  return { version: 1, installationId, data, updated, checkedAt };
}

export function restoreSnapshot(raw, expectedInstallationId) {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!value || value.version !== 1 || String(value.installationId) !== String(expectedInstallationId)) return null;
    if (!/^\d+$/.test(String(expectedInstallationId))) return null;
    const data = sanitizeMetrics(value.data);
    if (!data) return null;
    const updated = typeof value.updated === 'string' && Number.isFinite(Date.parse(value.updated)) ? value.updated : null;
    const checkedAt = Number.isFinite(value.checkedAt) ? value.checkedAt : null;
    return { version: 1, installationId: String(expectedInstallationId), data, updated, checkedAt };
  } catch {
    return null;
  }
}
