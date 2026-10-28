# 5.2.6: optional generative Jay integration

## Delivered and verification boundary

The prior feature/jay-ai-backend-20261017 branch contains a prototype that returns 501 without calling a provider. It was not a working generative service. This change supplies the missing Gemini REST request, same-origin frontend integration, recent conversation context, safe profile/telemetry selection, and response handling. It is deployed but disabled until server configuration and per-device opt-in exist. No actual model response or model quality has been verified; there are no provider credentials in the Site environment and no live provider calls were made.

The active application and production VRM Worker are unchanged in purpose: telemetry remains read-only. Neither main nor worker.js is modified. The private staging Site owns the new /api/jay/status and POST /api/jay/chat routes. GitHub Pages continues to support local equipment queries; generative routes require the independent Worker-backed Site. No provider key goes in the frontend, source repository, logs, localStorage or backup.

## Behavior

Users explicitly select Use generative AI. The UI distinguishes local rules, backend configured but not yet verified, active generative response, and failure. Sending remains text/voice/Both compatible. New requests include the question, at most three recent exchanges, selected installed-equipment fields and timestamped telemetry. APP_KEY, VRM_TOKEN, chassis, PDF files, photographs and raw diagnostics are not selected. Profile text is treated as untrusted data. Conversation pauses while waiting and resumes after the response; hidden-page cancellation suppresses late output.

A deterministic autonomy helper uses total bank Ah, SOC, configured minimum SOC and net discharge current. It rejects missing inputs, charging/zero current, demo/offline/stale data, and missing field timestamps. Its estimate assumes the present load/input balance stays constant. It explicitly does not simulate unplugging shore input or a change to solar/Anderson input. These scenarios require clarification. Total bank Ah and minimum SOC are new persistent My Caravan fields, included in secret-free backup/import.

## Activation (owner intervention required; not performed)

1. In Google AI Studio select/create an eligible **Free Tier project with no linked billing account**. Check its billing state and model availability. Do not add a payment method, enable billing, buy credits, or upgrade as part of this task. A free quota is not guaranteed for every account/model/region. If unavailable, stop rather than enabling paid access.
2. Review provider data terms: free-tier inputs/outputs may be used to improve Google products. Only send information the owner agrees to share. Device opt-in explains the question/history/equipment/telemetry transfer.
3. Configure these server-side environment variables on the existing owner-private staging Site, never in My Caravan or browser storage:
   - GEMINI_API_KEY: secret from the free-tier project. Never paste it into this chat or commit it.
   - JAY_AI_MODEL: exact eligible Gemini model ID from that project's model availability, beginning gemini-. No default model is assumed.
   - JAY_AI_POLICY: free-tier-no-billing, only after the project's billing state has been checked.
   - JAY_AI_ENABLED: true only when the owner is ready to activate.
4. In Jay select Check AI connection. A configured status does not prove inference. Enable Use generative AI and make two questions; inspect factual grounding and follow-up context. Test text/Voice/Both on the actual iPhone. Test quota failure without upgrading.
5. Disable JAY_AI_ENABLED or uncheck Use generative AI to return to local equipment queries.

The policy string records operator confirmation; the app cannot independently inspect Google's billing account. It cannot guarantee no charges if a billing-enabled key is supplied or billing is subsequently enabled. No secrets or enabled flags were set by this change.

## Limits and tests

Owner-private hosting supplies access control; the route additionally rejects other origins and methods. Never deploy this as a public multi-customer gateway without real customer authentication and durable rate limits. The in-memory single-flight/2.5-second guard is best effort per isolate, not a global quota or billing cap. Requests have a 24 KB input bound, question/history/profile bounds, 20-second provider timeout, capped output, fixed provider URL, no redirects/tools/search, no automatic retries and no paid fallback. Provider bodies/errors are not echoed. AI can still be mistaken; prompt instructions are not a proof of answer accuracy.

186 Node tests, 14 Python tests and app-runtime integration scenarios passed. New tests use mocked provider responses and cover disabled mode/no calls, context whitelist/zero tanks, two questions/history, Both/listening, quota failures, cancellation, blocked/empty responses, input bounds, concurrency, persistent runtime inputs and deterministic autonomy. This is not live Gemini validation, browser QA, or physical Safari validation. Logs: test-results/*-generative-20261028.txt.

Official references checked 2026-10-28:
- https://ai.google.dev/api/generate-content
- https://ai.google.dev/gemini-api/docs/billing
- https://ai.google.dev/gemini-api/docs/pricing.md
