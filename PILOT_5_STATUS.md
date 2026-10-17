# Smart Caravan Control 5.0 — Unified pilot status

## What exists (17 October 2026)
- `pilot-5.html`: single experimental UI in this branch, no deployment.
- My Caravan stores profile fields in localStorage.
- Multi-image gallery stores up to six local files in IndexedDB, each max 12 MB; pictures never uploaded.
- Digital Twin prototype lets the user manually place pins on a selected photo; pin locations currently last only until switching photos/reloading.
- Jay AI prototype uses rules over typed or spoken questions, saved profile and simulated readings; it is **not a connected generative model**. Browser speech needs hands-on iOS Safari testing.
- Telemetry dashboard **only simulates** VRM connection, old source timestamps and offline states; existing production application is linked separately for real VRM comparisons.
- `experiments/jay-ai/worker.js` is a fail-closed scaffold, not deployed and not enabled. It intentionally does not call an AI provider.

## Still required before claiming all five features work
1. Authenticated provider backend, quotas, privacy controls, manual and telemetry retrieval for intelligent Jay AI. Credentials stay in server secrets.
2. True transparent-background removal with consent using a separate image Worker, or a validated local segmentation model. No CSS fake removal.
3. Saved photo annotations and accurate per-caravan locations, model-specific schematics.
4. Integrate verified offline freshness module in the real VRM frontend and test with Cerbo hardware.
5. Integration, device, security and deployment checks; no changes to production before user approval.

## Monday pilot checklist
- Open experimental Pilot 5 (not the production URL). Confirm photo save/reload and voice permissions using a test image. No need to repeat prior Caravan Studio persistence checks.
- Create a test profile, attach photos, place visual pins.
- Ask 'Where are my batteries?', 'How many solar panels?', and 'Can I trust this reading?'
- Click Lose internet, Old reading, Recover. They are **simulated** and should not touch Cerbo.
- Open official VRM independently; inspect current source timestamps and compare with production SCC. Do not share VRM credentials or modify 240V/12V wiring.
