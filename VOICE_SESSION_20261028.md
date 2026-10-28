# Staging 5.2.3 — audible speech activation and foreground conversation

The user reported that recognition worked but Both replied only in text, and every question required another Talk tap. The screenshot confirms Both was selected. The prior implementation did not start synthesis inside a user gesture before automatic recognition-result replies. WebKit's SpeechSynthesis implementation removes its iOS speech-start restriction only when speak is called during a user gesture; otherwise its first non-gesture speech call can silently return.

Source: https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/speech/SpeechSynthesis.cpp — processingUserGesture / RequireUserGestureForSpeechStart.

## Changes
- Added explicit Enable / test voice, which speaks a readiness phrase from the button gesture. Selecting Both/Voice or starting a conversation also performs this initial spoken activation.
- Added a foreground conversation option. After an answer finishes, recognition starts again automatically; Talk remains available for one-shot questions. Optional custom wake-name behavior is retained. This does not claim background/Siri functionality or uninterrupted support in Safari.
- The browser is no longer categorically blocked from attempting conversation merely because its user agent contains Safari. Permission failures, repeated transient recognition errors, page hiding, or missing synthesis events stop the session and show a restart/error state.
- Added visible audio phases and failure codes. Silence without start events times out after six seconds instead of appearing as an unexplained text-only reply. Failures suggest opening the same app in Safari via the compass icon.
- Speech after microphone capture waits briefly for the capture session to release audio. Old speech callbacks/timers cannot interfere with new speech. Stop/hide cancels queued listening and playback. Readiness audio does not replace the answer used by Replay.
- Added a bounded local diagnostic field inventory and download button to investigate the AC/DC/tank fields shown on the local GX display but missing from the app. It excludes credentials/GPS/serial fields and raw textual values, and is not logged on the server. No field mapping is invented from screenshot values.

## Verification and limits
152 Node tests, 14 Python checks and runtime scenarios passed. Logs: test-results/*voice-20261028.txt. Tests include a WebKit-style user-gesture fixture, two consecutive conversational questions, audio-release timing, missing speech events, repeated microphone errors, stop/hide behavior, custom wake-name and cancellation handling. These are deterministic API fixtures, not a physical Safari audio test. Audible playback and automatic listening still require confirmation on the user's iPhone.

The selected-mode update from 5.2.2 is retained. Read-only VRM behavior, production Worker and main remain unchanged.
