# Development workflow

- `main` is the GitHub Pages production branch. Do not directly commit experimental changes there.
- `development` is the integration branch for changes and testing.
- Work on `development` (or a short-lived feature branch), then open a pull request to `main` after review.
- The GitHub Action validates basic HTML structure on `development` and pull requests to `main`. It **does not deploy** the app or Cloudflare Worker.
- Cloudflare production Worker, Victron tokens and other credentials are out of scope. Never commit secrets to GitHub or paste them into Codex.
- Live VRM telemetry requires separate authorized testing; passing static checks does not prove live connectivity.
- Do not deploy until the user has checked the changes, especially Jay AI voice and browser behavior on iPhone/iPad.
