import { assessReading, restoreSnapshot, snapshotFromVerifiedResponse } from './freshness.mjs';

/**
 * Advance a read-only VRM display after a single poll.
 * `transportOk` must reflect an actual successful HTTP exchange; callers must
 * authenticate/validate the upstream response before passing it here.
 * No requests, secrets, storage writes, or hardware controls happen here.
 */
export function nextTelemetryState({ previous = null, response = null, transportOk = false, installationId, now = Date.now() } = {}) {
  const cached = restoreSnapshot(previous, installationId);
  const cachedAge = cached ? assessReading({ data: cached.data, updated: cached.updated, transportOk: false, now }).ageMs : null;
  if (!transportOk) {
    return { snapshot: cached, status: cached ? 'offline' : 'error', ageMs: cachedAge, isLive: false, reason: 'transport_failure' };
  }

  const incoming = snapshotFromVerifiedResponse(response, now);
  if (!incoming || incoming.installationId !== String(installationId)) {
    return { snapshot: cached, status: cached ? 'unknown' : 'waiting', ageMs: cachedAge, isLive: false, reason: 'unverified_response' };
  }

  const assessed = assessReading({ data: incoming.data, updated: incoming.updated, transportOk: true, now });
  if (assessed.status === 'unknown') {
    return { snapshot: cached, status: 'unknown', ageMs: cachedAge, isLive: false, reason: 'invalid_source_timestamp' };
  }

  const oldTime = cached?.updated ? Date.parse(cached.updated) : NaN;
  const newTime = Date.parse(incoming.updated);
  if (Number.isFinite(oldTime) && newTime < oldTime) {
    return { snapshot: cached, status: 'stale', ageMs: cachedAge, isLive: false, reason: 'source_timestamp_regressed' };
  }
  if (Number.isFinite(oldTime) && newTime === oldTime && JSON.stringify(cached.data) !== JSON.stringify(incoming.data)) {
    return { snapshot: cached, status: 'unknown', ageMs: cachedAge, isLive: false, reason: 'conflicting_same_timestamp' };
  }
  return { snapshot: incoming, ...assessed, reason: 'verified_reading' };
}
