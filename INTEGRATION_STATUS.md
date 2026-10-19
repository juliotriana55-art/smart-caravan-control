# Integrated test candidate — NOT READY FOR ONE-PASS ACCEPTANCE

This branch combines:
- Safari tap-to-talk UI and recognition restart;
- per-tank 0% tolerant display from a **future** `data.tanks` VRM payload;
- Jay AI rules describing individual tanks **only when actual tank records are provided**;
- smoke test `python -m unittest tests/test_integrated_pilot.py`.

## Blocking items for a single real-caravan test
1. Production Worker still explicitly reports `inverter:null` and `waterPct:null`, and doesn't return `tanks` or supported `acLoadsWatts`. Do not pretend frontend can fix this.
2. Actual diagnostics code/device sample for this installation needed to map inverter, DC, AC and both fresh water sensors. Production Worker stays unchanged. Prototype VRM field parser: `feature/vrm-inverter-tanks-20261019/experiments/vrm-fields/parser.mjs` is **untested against device API**.
3. Deploy separate authenticated staging Worker only with explicit approval; do NOT overwrite `smart-caravan-api` or alter main. Avoid URL credentials and never share VRM_TOKEN/APP_KEY.
4. Voice behaviour needs real Safari mic permission and consecutive-speech test.
5. Generative Jay AI and automated 3D scan are not available; cannot count those as passing.

## One-pass acceptance criteria
- Safari: Tap Talk, two questions, two responses; then Both spoken reply;
- VRM real: battery, voltage, inverter state, DC power, two tanks at 0%; data age clearly marked;
- network: stale on last-reading, offline on failure, updated after recovery;
- studio: personalised 2D and guided photo capture; distinguish generated 3D from a photo-based mesh;
- safety: no modifications to Victron hardware, main or production Worker.
