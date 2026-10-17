# Smart Caravan Control — Background removal design (prototype only)

## Verified baseline (17 Oct 2026)
Owner tested `feature/studio-local-photo-20261017` on iPad Safari: photo persisted after reload, and Remove photo worked. These are manual user-reported outcomes. No server uploads or AI cutouts were tested.

## Goal
Use customer photos to create an accurate, customer-specific 2D exterior image with genuine transparent background, premium showcase and later equipment pins. This is not a 3D reconstruction. Never imply that the physical equipment location can be deduced from external photos.

## Selected architecture (not deployed)
1. Static app on GitHub Pages, selecting photo using `<input type=file accept=image/*>`. Existing local IndexedDB keeps the original on that device.
2. Display explicit **Remove background with AI** action and consent: photo will be sent to Cloudflare and to the designated AI provider for processing. Default remains local-only. Do not send photos when merely choosing them.
3. Browser client downsizes and converts to supported JPEG/PNG format, strips EXIF via Canvas and enforces maximum dimensions and bytes before upload. Handle large HEIC photos gracefully with error/fallback and measure Safari canvas memory.
4. A separate Cloudflare Worker (e.g. `smart-caravan-images-dev`, never `smart-caravan-api`) accepts authenticated POST /remove-background over HTTPS, verifies allowed Origin and session, validates content type and actual bytes, maximum request size, rate and daily usage limits, and calls Cloudflare Workers AI `bria/remove-background`. No provider credentials in GitHub Pages. Cloudflare documents $0.018/image as model pricing at time of investigation.
5. Workers AI can return a temporary hosted cutout URL (documented 3-day lifetime by default). Backend fetches/downloads only the needed output after validating destination or uses provider result directly as permitted; **do not** save the remote output URL as durable storage. Never log raw images or image data. Review Cloudflare/Bria retention terms before commercial deployment.
6. Return the resulting PNG securely to the browser, cache locally in IndexedDB as separate `processed` blob with versioned schema and explicit delete controls. Do not place customer pictures in public GitHub repositories or public buckets. Do not retain cloud copies unless the owner opts in to sync.
7. Render the transparent PNG on a neutral premium stage with CSS shadow, sizing and position. The cutout is real pixel transparency, not a CSS imitation. Give user before/after preview and the option to keep original.
8. Use separate staging hostname, strict CORS allowlist, content security policy, no wildcard production origin, no caching of sensitive uploads. Keep original VRM proxy and GitHub Pages main unaffected.

## Alternative
Local-only `RMBG-1.4` via Transformers.js/WebAssembly, as demonstrated by addyosmani/bg-remove. Privacy benefit: photos stay on the device. Drawback: ~176 MB initial model download, memory/performance on iOS Safari not verified; assess device compatibility and model licensing/commercial terms before adoption.

## Pilot tests / approval gates
- iPad Safari: save, reload, remove and re-select photos; confirm no background requests before explicit consent.
- Images: front / rear / side, white-on-white caravans, fine awnings/tow chains, outdoor surroundings, transparent-window artifacts and unusual angles; check cutout edges manually.
- Large HEIC/JPEG photos and slow networks: no tab crashes; clear size/progress/error states.
- 401 without session, 403 from disallowed origin, 413 oversized, 415 unsupported input, 429 rate limit and provider failure; never expose tokens.
- Verify output URL lifetime and privacy terms, actual invoice/usage controls, client-side deletion and optional retention policy.
- Backend inference service and iPad integration must pass before claiming AI cutout works in the product.
- Only deploy to a separately approved staging Worker; never touch `main` or the existing Victron Worker.

## Official references
- https://developers.cloudflare.com/ai/models/bria/remove-background/
- https://github.com/addyosmani/bg-remove
- https://github.com/backblaze-b2-samples/b2-transformerjs-background-removal
