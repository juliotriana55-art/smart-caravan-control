# 5.2.4: AC output mapping and complete diagnostic inventory

The owner's real 2026-10-28 diagnostic export contains VE.Bus instance 276, PC=1 and OP1=40 W at 05:24:48Z. AC loads remained null because the mapper did not support these codes. No uploaded private configuration or telemetry is committed.

The read-only mapper now uses OP1..OP3 only with a reported phase count, complete nonnegative numeric phase readings, timestamps within 60 seconds, and a single unambiguous VE.Bus group. The oldest contributing phase timestamp controls freshness. It never substitutes input power or apparent V*A. Existing system AC consumption mapping takes precedence.

The old inventory matched the VE.Bus device label on every record and cut the first 80 matches, hiding later device fields. Inventory now filters measurement descriptions/codes instead, retains up to 512 records and includes a bounded device class. It continues excluding credentials, location fields and raw text values. DC and tank mappings remain unverified on this installation until a new complete export is available; no screenshot values were hardcoded.

Validation: 159 Node tests passed, 14 Python tests passed, and app runtime integration scenarios passed. New tests cover actual single-phase OP1 shape, zero, missing/invalid/old values, incomplete/asynchronous phases, ambiguity and inventory truncation. Logs are in test-results/*-mapping-20261028.txt. Browser APIs are mocked; these results do not prove physical Safari audio or caravan measurements. Production Worker and main are unchanged.
