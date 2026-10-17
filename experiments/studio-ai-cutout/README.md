# Caravan Studio — private AI cutout staging

Status 17 October 2026: architecture researched; separate local source package and 11 mocked Node tests passed. No real Bria inference, no iPad AI test, no deployment. The source package is not yet committed here.

Safety gates: separate Worker; Access JWT verification; exact origin; JPEG/PNG and size validation; D1 daily quota; output host allowlist; consent and EXIF removal in browser. Cross-site Safari Access authentication needs a separate design.

Model: https://developers.cloudflare.com/ai/models/bria/remove-background/
