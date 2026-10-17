# Monday 19 October — VRM timestamp safety check

## Verified issue
Before the patch, the JavaScript timestamp parser accepted a source timestamp without an explicit timezone and classified it as `fresh`. Different Safari devices can interpret such values using different local timezones. A timezone-less timestamp must not be treated as a trustworthy instant.

## Change
The experimental `freshness.mjs` now accepts only ISO timestamps with an explicit `Z` or numeric offset, such as `2026-10-19T08:00:00Z` or `2026-10-19T19:00:00+11:00`. Ambiguous times are `unknown` while connected, and cached values remain `offline` when transport fails. Invalid timestamps are not saved as valid cache timestamps.

## Automated regression tests
New file: `timezone.test.mjs` (six cases). Run from the repository root:
```sh
node --test experiments/vrm-offline/*.test.mjs
```
Existing GitHub Actions workflow currently runs `freshness.test.mjs` only; do not claim the new timezone tests have passed CI until that is updated and a run succeeds.

## Monday hardware checklist
1. Check Cerbo internet connection and VRM source timestamp, using read-only dashboards.
2. Compare battery SOC, voltage, solar power and the source timestamp against SCC.
3. Safely interrupt internet connectivity at the authorised network controls, never 12V/240V cabling.
4. Verify the UI never claims old cached values are live; restore internet and wait for a *new* source timestamp.
5. Log differences and Safari behaviour separately; experimental logic is **not yet wired into the production Dashboard**.

No production Worker changes, secrets, deployment, PR merge or main edits.
