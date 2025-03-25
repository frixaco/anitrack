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
- [x] Keep history of watched episodes and allow streaming them
- [ ] Save search keywords (since they are basically anime titles) and add autocomplete

### Why I stopped working on the web app?

- The amount of work required to get subtitles working is too much for the scope of the After trying bunch of video player libraries and [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm), I decided to stop making a browser app.
- Non-browser app lets me use [Anime4K](https://github.com/bloc97/anime4k) upscaler for better quality

<!-- ## TODO

- [ ] Add support for subtitles (MKV are not natively supported, but with ffmpeg+webassembly it might be possible)

## Setup

- Install Bun

```bash
bun install
bun dev
``` -->
