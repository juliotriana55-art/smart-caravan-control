// Same implementation is loaded directly by the browser; no dynamic module loading during capture.
import './telemetry-core.js';
export const normalizeStagingTelemetry=globalThis.SCCTelemetry.normalize;
