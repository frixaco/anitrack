# Anitrack - Simple anime release tracker for myself

CLI app written in Go using [Bubbletea](https://github.com/charmbracelet/bubbletea) framework. Let's me search, watch/stream, download and track anime from a torrent source.

## Setup

1. Install Go. I use 1.23.
2. Install [mpv](github.com/mpv-player/mpv) player.
3. (Optional) I recommend setting up **Anime4K** anime upscaler for **mpv**: https://github.com/bloc97/anime4k
4. Run `go install github.com/frixaco/anitrack` or download the binary from releases

## TODO

- [x] Add text input and a table with navigation support
- [x] Implement searching logic and populate results table with option to launch selected episode in [mpv](https://github.com/mpv-player/mpv/)
- [ ] Save watched episodes
- [ ] Save search keywords (since they are basically anime titles) and add autocomplete

<!-- ## TODO

- [ ] Add support for subtitles (MKV are not natively supported, but with ffmpeg+webassembly it might be possible)

## Setup

- Install Bun

```bash
bun install
bun dev
``` -->
