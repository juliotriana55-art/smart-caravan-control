# Smart Caravan Control — AI and scanning roadmap

## Principle
Jay AI must not pretend fixed FAQ templates are general intelligence. Present telemetry, saved equipment facts, and inferred advice separately. The browser must not contain LLM API keys or Victron credentials.

## Jay AI (next production candidate)
1. User speech is transcribed after permission and a user gesture on iOS Safari. Provide a text fallback. Continuous hands-free wake word is not guaranteed in mobile browsers.
2. An authenticated backend receives the user's question, selected caravan ID, and *minimal* relevant context: equipment profile, permitted latest Victron snapshot including source time, location and maintenance notes.
3. The language-model service uses retrieval over each caravan's own manuals and configuration records. Never retrieve another owner's documents.
4. Structured tools expose read-only telemetry and equipment details. Unavailable or stale readings are clearly marked; do not fabricate values or claim controls have been performed.
5. Respond in Spanish or Australian English with both text and optional speech. Do not log raw voice by default. Use explicit user control for history and deletion.
6. Apply budget caps, authentication, rate limiting, and consented retention. Evaluate answer accuracy with a fixed bilingual test set.

## Caravan scanning and personalised digital twin
- **Prototype now:** caravan-studio.html lets customers choose a body style, finish, basic solar equipment, and select a local reference photo. It is NOT a scan, AI reconstruction or accurate 3D representation.
- **Next prototype:** photo capture guidance (front, rear, left and right side; inside floorplan), user confirmation of measurements and fixtures.
- **AI-assisted modelling:** optional consented image processing to propose a caravan silhouette and marked components; allow manual correction before saving. Do not infer precise hidden component positions from a photograph.
- **Commercial implementation:** generate an individual, editable 2D floorplan and equipment map; support manufacturer-approved template libraries and customer-specific overrides.
- **Later:** optional camera-based 3D reconstruction, with hardware/device compatibility and privacy evaluation.

## Gates before production
- Test sequential speech recognition and speech synthesis on real iPhone and iPad Safari.
- Test unit, integration, and permission isolation for the new backend.
- Confirm the VRM proxy remains independent of Jay AI endpoints.
- Never ship Cloudflare secrets to GitHub Pages.
- Privacy review and opt-in for images, manuals, and AI processing.
