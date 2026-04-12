## Anitrack - Simple TUI app I use to stream anime using my own `LeTUI` library

1. Install [Bun](bun.sh)
2. Install [mpv](github.com/mpv-player/mpv) player.
3. (Optional) On desktop, set up [**Anime4K**](https://github.com/bloc97/anime4k) anime upscaler for **mpv**
4. `bunx @frixaco/anitrack`

Status: complete

### Releasing

Preferred flow uses GitHub Actions.

1. Update `version` in `package.json`
2. Commit and push that change to `main`
3. Create and push a matching tag:
   - `git tag -a v0.1.1 -m "v0.1.1"`
   - `git push origin v0.1.1`
4. GitHub Actions workflow `.github/workflows/npm-publish.yml` will publish to npm

Notes:

- Tag must point at the commit containing the new `package.json` version
- Tag name should match package version, e.g. `v0.1.1` -> `0.1.1`
- Publishing requires `NPM_TOKEN` configured in GitHub repo secrets
- If that version already exists on npm, publish will fail

Manual fallback:

1. Log in: `bunx npm login`
2. Publish: `npm publish --access public`

## Legacy

Note: Ignore everything under [legacy](./legacy/) 

The project has been ported multiple times as I kept exploring different technologies for fun:

- Next.js app (auth, search, tracker, stream, etc.)
- Go TUI using Bubbletea
- Python TUI using Textual
- `letui` TUI - my own TUI library written from scratch using TypeScript (Bun) and Rust

### Python TUI

1. Install `uv` (https://docs.astral.sh/uv/getting-started/installation/)
2. Install [mpv](github.com/mpv-player/mpv) player.
3. (Optional) On desktop, set up **Anime4K** anime upscaler for **mpv**: https://github.com/bloc97/anime4k
4. Run `uv tool install frixa-anitrack`
5. Run `anitrack`

NOTE: to try without installing, run `uv tool run --from frixa-anitrack anitrack` or `uvx --from frixa-anitrack anitrack`

Status: finished.

### Go TUI

1. Install Go. I used +1.23.
2. Install [mpv](github.com/mpv-player/mpv) player.
3. (Optional) On desktop, set up **Anime4K** anime upscaler for **mpv**: https://github.com/bloc97/anime4k
4. Run `go install github.com/frixaco/anitrack@latest` or download the binary from releases

Status: finished.

### Next.js

Fully functional, but requires setting up environment variables and services.

Status: abandoned.

### Rust TUI

Explored scraping HTML pages a bit. Don't plan to continue for the time being.

Status: dormant.
