# Anitrack - Web app to auto-track new episodes of any anime from nyaa.si and aniwave.to

| Database provider  | Supabase (Postgres)     |
| ------------------ | ----------------------- |
| Auth               | Supabase (Google OAuth) |
| API                | Golang                  |
| API deployment     | Fly.io                  |
| Next.js deployment | Fly.io                  |

## Golang API to webscrape [nyaa.si](http://nyaa.si) and [aniwave.to](http://aniwave.to)

### TODO for Webscraper API:

- [x] Create a HTTP server with 2 routes, both accept POST requests. Server should parse request body as JSON and return JSON response
- [x] For route 1, server should receive JSON stringified object:
  ```jsx
  {
  	"nyaaUrl": "https://nyaa.si/?f=0&c=1_2&q=ember+frieren",
  	"aniwaveUrl": "https://aniwave.to/watch/sousou-no-frieren.3rp2y/ep-2"
  }
  ```
- [x] Create Colly Collector that can visit [nyaa.si](https://nyaa.si) and [aniwave.to](https://aniwave.to) (let’s call this “webscraping”
  - [x] For [nyaa.si](https://nyaa.si), extract episode number using regex (from upload title) and magnet link
  - [x] For [aniwave.to](https://aniwave.to), extract episode number (from episodes section) and stream url
- [x] Get `latestEpisode`
  - [x] [nyaa.si](https://nyaa.si) - Sort by episode number, get last one
  - [x] [aniwave.to](https://aniwave.to) - same
- [x] Get `title`
  - [x] [nyaa.si](https://nyaa.si) - Extract from any upload/episode title using regex
  - [x] [aniwave.to](https://aniwave.to) - Use correct selector
- [ x Get `nyaaUrlForFirstUnwatchedEpisode` - Similar to `latestEpisode` for [nyaa.si](https://nyaa.si)
- [x] Get `nineanimeUrlForFirstUnwatchedEpisode` - Similar to `latestEpisode` for [aniwave.to](https://aniwave.to)
- [x] Implement database connection and add new row to `Release` table
- [x] For route 2, add a function that gets users existing releases’ [nyaa.si](http://nyaa.si) and [aniwave.to](https://aniwave.to) urls and does “webscraping” and updates releases in DB

### TODO for Next.js app:

- [x] Write action for marking an episode as watched
- [x] Write action for getting episode watch history
- [x] Write action for getting tracked releases
- [x] Add UI for tracked releases
- [x] Add UI for watch history
- [x] Implement release adding
- [x] Mark episodes as watched

**Polish**

- [ ] Improve UI for displaying multiple unwatched episodes
- [ ] Improve UI for release adding

- [ ] For unauthorized users, research how to have “temporary” users and handle their data
