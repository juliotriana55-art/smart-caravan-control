# Victron missing fields — pilot investigation (19 Oct 2026)

**Observed:** VRM/GX displays MultiPlus-II 'Inverting', DC power approx 150 W, two 95 L fresh-water tanks at 0%. Public SCC 4.4.3 shows dashes for these three areas. SCC battery fields correctly correspond to VRM.

**Root cause confirmed in code:** `development/worker.js` builds the `/telemetry` payload from VRM diagnostics and explicitly sets `inverter:null,waterPct:null`. DC power is only recognised when diagnostic code `Pdc` AND the device description matches a narrow string. The public `index.html` supports only one `waterPct` field, not a `tanks[]` collection. These behaviours explain the missing UI fields without suggesting hardware failure.

**Experimental change:** `experiments/vrm-fields/parser.mjs` adds conservative parsing for separately named tanks (including a valid 0%), AC loads, DC power, and VE.Bus inverter state, with tests in `parser.test.mjs`. Parsing is deliberately strict: unfamiliar VRM formats produce null rather than false readings. The exact diagnostic schema of this Cerbo installation has **NOT** been verified, so no claim that this correctly reads real tanks.

**Next required step:** capture a REDACTED sample of the VRM diagnostics JSON from an authenticated staging call, examine available codes/device names for MultiPlus-II, DC system, Fresh Water 1 and Fresh Water 2. Do not paste APP_KEY/VRM token. Map actual diagnostic format, connect to a separate experimental Worker and UI, validate on this Cerbo before changing production. Avoid a public unsecured debugging endpoint.

**How to run local tests** (Node 20+): `node --test experiments/vrm-fields/parser.test.mjs`. Not yet executed in CI as of this commit.

No production Worker, secrets, `main`, or live caravan settings were changed.

## Nightly update — 19 Oct 2026
- Fixed inverter VE.Bus label and textual state matching, and suppressed telemetry when the input explicitly reports offline.
- Added four regression tests; 13/13 passed in isolated V8 execution of the GitHub sources (not CI or Node test runner).
- Hardware verification remains blocked by lack of a redacted real VRM diagnostic fixture; stale timestamps are not yet validated.
- No production integration, Safari voice, generative AI or automatic 3D was verified.

## Overnight note — 20 October 2026
Added an experimental freshness guard with fresh/stale/offline/unknown states. It hides old and undated inverter, DC and tank readings. Six regression cases were added; 19/19 JavaScript checks passed in isolated V8, not Node or CI. Source timestamps are currently assumed to be Unix seconds. Real VRM schema and timestamps are not validated. Safari voice and live UI integration remain unverified. Production and main were not modified.
