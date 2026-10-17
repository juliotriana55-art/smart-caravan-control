# Safari Voice — manual regression checks (18 October 2026)

This document describes a non-production pilot. Do not deploy to production.

1. Open pilot-voice-session-20261018.html in iPhone Safari.
2. Tap Talk, grant microphone permission and say "Where are my batteries?"
3. Wait until the listening indicator ends. Tap Talk again and say "How many solar panels?"
4. Repeat three times; record whether the second recognition starts normally.
5. Change to Español, tap Talk, and ask "¿Dónde están las baterías?"
6. If the microphone is unavailable, verify typed questions still work.
7. Verify all displayed energy readings are explicitly labelled simulated in pilot-5.html.

Pass criterion: two consecutive speech recognitions without a page refresh.
Known limitations: browser support and permissions; not a generative model or live Cerbo GX connection.
