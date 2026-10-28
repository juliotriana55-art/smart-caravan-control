# 5.2.5: VRM tank instances and signed DC system power

The owner's new diagnostic inventory exposed lowercase `dc` / `DC System`, and tank-instance fields `tl` / `Tank level`, `tf` / `Tank fluid type`, `ts` / `Tank status`, `tcn` / `Tank custom name`. The numbered-label parser missed these shapes. Uploaded telemetry and private backups are not committed.

DC system power now accepts the exact `dc` code and system description, preserving its signed watts. Anderson DC-DC input and `Pdc` / PV DC-coupled values do not substitute for DC system power.

Fresh-water levels are joined with fluid type by numeric instance. Type 1 identifies fresh water, valid numeric zero remains zero, newest missing readings suppress older values, and current sensor errors suppress levels. Configuration-only instances do not create measurements. Reported numbered fresh-water names are retained; otherwise the UI identifies the VRM instance explicitly rather than guessing its physical tank number. The main water card shows the count when individual readings are available. Each level retains its own timestamp and expiry.

Primary reference: https://github.com/victronenergy/dbus-adc/blob/master/README.md documents level 0..100%, fluid type 1 fresh water, and status 0 OK / 1 disconnected / 2 short circuit / 3 reverse polarity / 4 unknown.

Validation: 168 Node tests, 14 Python tests, and mocked app-runtime integration scenarios passed. Numeric replay of the owner's uploaded inventory recovered AC 41 W, DC -14.508 W and two distinct fresh-water instances at 0%. This is replay of an existing diagnostic, not a new physical measurement or Safari browser test. Full raw diagnostic fields and custom names were not available in the sanitized inventory. Logs: test-results/*-tanks-20261028.txt. Production Worker and main are unchanged.
