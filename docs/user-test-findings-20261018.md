# User test findings — 18 Oct 2026

Source: observed iPhone Safari user walkthrough. This is a test plan, not proof of a fix.

## Confirmed in user test
- Typed question field exists; voice transcription populated question and generated a written contextual response.
- Voice capture requires tapping Talk again for each question; Speak answer is a separate tap.
- Local question history was visible and user liked the clear-history action.
- Photo library displayed one locally saved image; Show + pin placed two inverter markers on it.
- Existing pins could not be repositioned through the tested interface.
- Six-view checklist only toggles checkboxes; it does not launch the camera or link a photo to a named view.

## Next small fixes (not implemented yet)
1. Add saved response preference: text / voice / both. Preserve manual en-AU / es-ES selection. Never claim hands-free Safari wake word.
2. Add voice output after response only with supported browser gesture behavior; handle speech errors and second-turn recovery.
3. Join six named photo slots with file capture/upload; auto-check on successful save. Preserve existing IndexedDB photos and migrations.
4. Pin edit/move/delete one-by-one; allow equipment location as text + associated interior detail photo even if no visual pin.
5. Distinguish simulation from real VRM read-only snapshots and stale/offline data. Never insert tokens in frontend.

## Acceptance checks before user pilot
- Safari iPhone: two voice questions in succession, microphone releases, written response always appears; voice mode handles unavailable synthesis clearly.
- Settings persist across reload: language and response preference.
- User can enter text without microphone permission.
- Each named photo slot can capture/upload and reopen its own image; photo persistence is not reimplemented unnecessarily.
- One pin can be repositioned without deleting the others; equipment behind interior panels can have a detail photo and explicit location text.
- No production worker, main branch, paid backend, generative AI, background removal, or automated 3D scanning touched.

## Monday Cerbo gate
- Confirm consent, physical access and Cerbo connectivity; verify VRM dashboard first.
- Read-only calls only, verify timestamp, installation ID and error handling; avoid displaying or logging tokens.
- Treat missing network data as unavailable, not zero. No write/control endpoints.
