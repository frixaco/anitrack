# Anitrack - anime release tracker

Tags: IN PROGRESS

| Database provider  | Supabase (Postgres)     |
| ------------------ | ----------------------- |
| Auth               | Supabase (Google OAuth) |
| API                | Golang                  |
| API deployment     | Fly.io                  |
| Next.js deployment | Fly.io                  |

## Golang API to webscrape [nyaa.si](http://nyaa.si) and [9animetv.to](http://9animetv.to)

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
  - [x] [aniwave.to](https://9animetv.to) - same
- [x] Get `title`
  - [x] [nyaa.si](https://nyaa.si) - Extract from any upload/episode title using regex
  - [x] [aniwave.to](https://aniwave.to) - Use correct selector
- [ x Get `nyaaUrlForFirstUnwatchedEpisode` - Similar to `latestEpisode` for [nyaa.si](https://nyaa.si)
- [x] Get `nineanimeUrlForFirstUnwatchedEpisode` - Similar to `latestEpisode` for [aniwave.to](https://aniwave.to)
- [x] Implement database connection and add new row to `Release` table
- [x] For route 2, add a function that gets users existing releases’ [nyaa.si](http://nyaa.si) and [aniwave.to](https://aniwave.to) urls and does “webscraping” and updates releases in DB

### TODO for Next.js app:

- [ ] Write action for marking an episode as watched
- [ ] Write action for getting episode watch history
- [ ] Write action for getting tracked releases
- [ ] Add UI for displaying multiple unwatched episodes
- [ ] Add UI for tracked releases
- [ ] Add UI for watch history
- [ ] Implement release adding - adding new release closes the drawer, new release should be in Tracked Releases section, unwatched episode(s) should be in New Episodes section
- [ ] Mark episodes as watched - removed from New Releases section, once release is updated in db, all sections should be refetched+updated

- [ ] For unauthorized users, research how to have “temporary” users and handle their data
