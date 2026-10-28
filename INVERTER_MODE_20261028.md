# Staging 5.2.2 — separate VE.Bus mode from operating state

Selected switch mode is not the same as operating state. The UI and Jay now report them independently. The prior generic ON reading from VE.Bus state 9 is labelled Inverting, not selected mode ON or Inverter only.

Explicit recognized VE.Bus mode records use the official enum: 1 Charger only, 2 Inverter only, 3 On, 4 Off. The parser only applies it to identifiable MultiPlus/Quattro/VE.Bus records with explicit mode/switch-position semantics. It does not apply these values to standalone solar charger mode records, infer mode from battery current, or treat VE.Bus operating state 3 (bulk charging) as mode On. Unavailable, stale or unknown modes remain missing.

Source: https://github.com/victronenergy/venus-html5-app/blob/master/TOPICS.md (Mode switch position enum, separate from SystemState/State).
Source: https://www.victronenergy.com/media/pg/VRM_Portal_manual/en/control-your-devices-in-vrm.html

141 Node tests and 14 Python checks passed, plus runtime scenarios. Logs: test-results/*mode-20261028.txt. Added 11 tests for mode enums, state separation, expiry, unknown fields, unrelated chargers, sanitization and Jay answers. This verifies interpretation against fixtures. The actual mode field in installation 1013398 still needs to be observed; only operating-state, battery and solar reception have been shown in the user's screenshots.

Read-only behavior retained. No control commands, production Worker or main changes.
