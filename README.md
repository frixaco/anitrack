## Anitrack - Simple TUI app I use to stream anime using my own `LeTUI` library

1. Install [Bun](bun.sh)
2. Install [mpv](github.com/mpv-player/mpv) player.
3. (Optional) On desktop, set up [**Anime4K**](https://github.com/bloc97/anime4k) anime upscaler for **mpv**
4. `bunx @frixaco/anitrack`

Status: complete

### Releasing

Publishing uses npm trusted publishing through `.github/workflows/npm-publish.yml`. The workflow receives a short-lived OpenID Connect credential from GitHub. It does not use an `NPM_TOKEN` secret.

1. Update `version` in `package.json`.
2. Verify the package:

   ```bash
   bun x tsc --noEmit
   npm pack --dry-run
   ```

3. Commit the version change.
4. Create a matching tag and push the commit and tag together:

   ```bash
   git tag vX.Y.Z
   git push --atomic origin main vX.Y.Z
   ```

The tag must point to the commit containing version `X.Y.Z`. A tag push runs the publish workflow. npm rejects a version that already exists.

The npm package must trust GitHub Actions for repository `frixaco/anitrack`, workflow `npm-publish.yml`, with `npm publish` permission.

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
