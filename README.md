# Anitrack - Simple TUI to stream anime

The project has been ported multiple times as I kept exploring different technologies for fun:

- Next.js app (auth, search, tracker, stream, etc.)
- Go TUI using Bubbletea
- Python TUI using Textual
- `letui` TUI - my own TUI library written from scratch using TypeScript (Bun) and Rust

### Bun+Rust TUI

1. Install Bun (recommended) or Node
2. Install [mpv](github.com/mpv-player/mpv) player.
3. (Optional) On desktop, set up **Anime4K** anime upscaler for **mpv**: https://github.com/bloc97/anime4k
4. `bunx @frixaco/anitrack`

Status: almost finished

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
