# 5.2.8: explicit My Caravan field labels and examples

My Caravan previously labelled numeric counts simply Batteries and Solar panels. Users could not tell whether to enter count, Ah, watts, or location. The form now identifies those count fields explicitly and supplies persistent English/Spanish help plus example placeholders for every equipment/profile field.

Battery guidance distinguishes count, per-unit chemistry/voltage/Ah, series/parallel wiring, total bank Ah, chosen minimum SOC, and exact location. Solar guidance asks for count separately from per-panel and total W. Inverter guidance distinguishes W/VA and system V. Charger guidance separates AC/DC-DC specifications from locations and the external Anderson feed. Tank guidance asks only for installed tanks, their names, fluid types, capacity in L and locations, independent of available sensor channels. Heater, suspension, airbags, extra equipment, caravan identifiers and manual fields each state the intended data and units where applicable.

Examples are placeholders/help only; they do not prefill or replace saved caravan values. Storage field names and the existing autosave/backup paths are unchanged. Help remains visible while editing and is associated with inputs via aria-describedby.

Validation: existing 187 Node tests, 14 Python tests and mocked app-runtime integration checks passed. Logs: test-results/*-profile-help-20261028.txt. This change does not claim a new physical iPhone/browser validation or model-quality test. Main and production Worker are unchanged.
