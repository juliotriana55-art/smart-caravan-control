// Experimental, opt-in safety adapter. Not connected to production UI or Worker.
import { extractNormalizedSnapshot } from './iso-normalized.mjs';
export function extractSafeSnapshot(diag, options = {}) {
  const status = String(diag?.status ?? '').trim().toLowerCase();
  const offline = diag?.online === false || status === 'offline' || status === 'disconnected';
  const source = offline ? { ...(diag ?? {}), online: false } : { ...(diag ?? {}) };
  const snapshot = extractNormalizedSnapshot(source, options);
  if (snapshot.status !== 'fresh') return snapshot;
  // An unrelated diagnostic cannot prove the requested telemetry is live.
  // Zero watts and zero percent are real readings; null is missing.
  const hasReading = snapshot.dcPower !== null || snapshot.acLoadsWatts !== null ||
    snapshot.inverter !== null || snapshot.tanks.length > 0;
  return hasReading ? snapshot : { ...snapshot, status: 'unknown' };
}
