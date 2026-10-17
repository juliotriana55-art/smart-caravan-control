# Jay AI secure integration — first backend scaffold

This is **not a working AI service yet**. It deliberately fails closed. No money is spent and no tokens are committed.

- Separate Cloudflare Worker (not `smart-caravan-api`) to hold an AI provider secret, never JavaScript on GitHub Pages.
- User identity must be verified **server-side**, not by a client-supplied password or a Boolean flag.
- Rate limit and spending budget before enabling provider calls.
- Minimal caravan context: equipment profile and VRM source timestamp, only after owner authorization. Missing / stale readings are clearly identified.
- Reject prompt injection in manuals or user-provided documents. No control operations in first release.
- Protect cross-origin requests with CORS **and** authentication (CORS alone does not protect endpoints).
- Never store raw audio, access keys, or private manuals in frontend source.
- iOS Safari speech recognition and speech synthesis remain a separate compatibility test; no promise of hands-free wake word in background.
- To move from scaffold to real answers: implement authentication, prompt building with owner-scoped retrieval, OpenAI Responses API call with validated results, quotas, structured logging without sensitive contents, and integration tests. Obtain explicit approval for spend.
- The worker returns 503 when the AI provider secret or auth is missing, and 501 when setup is incomplete. It never calls a paid API.

## Security test checklist
1. Non-allowlisted origin -> 403
2. Unconfigured provider -> 503
3. Unconfigured authentication -> 503
4. No unintended calls to models or Victron when disabled
5. No credentials in `index.html`
6. Separate deployment name, not production VRM Worker
