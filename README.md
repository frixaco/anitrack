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
  	"nineanimeUrl": "https://9animetv.to/watch/frieren-beyond-journeys-end-18542?ep=107257"
  }
  ```
- [x] Create Colly Collector that can visit [nyaa.si](http://nyaa.si) and [9animetv.to](http://9animetv.to) (let’s call this “webscraping”
  - [x] For [nyaa.si](http://nyaa.si) links it should get all <a> tag URLS that start with `magnet:`
  - [x] For [9animetv.to](http://9animetv.to) links it should get all <a> tag URLS that have same URL as passed `url` without query params. <a> tag URLs must have `?ep=123123` query param at the end
- [ ] Get `latestEpisode`
  - [ ] [nyaa.si](http://nyaa.si) - Get count of all <a> tags that match `^/view/[0-9]$` . Then make a list of titles using `title` attribute of each <a>. Somehow (using AI?) figure out the number of last episode (!= total episodes)
  - [ ] [9animetv.to](http://9animetv.to) - Last valid (see above) <a> has child <div>. It’s content is the number of last episode (!= total episodes)
- [ ] Get `title`
  - [ ] [nyaa.si](http://nyaa.si) - Use method above and extract (using AI?) the release title from <a> `title` attribute
  - [ ] [9animetv.to](http://9animetv.to) - `h2.film-name`'s text content
- [ ] Get `nyaaUrlForFirstUnwatchedEpisode` - Similar to `latestEpisode` for [nyaa.si](http://nyaa.si)
- [ ] Get `nineanimeUrlForFirstUnwatchedEpisode` - Similar to `latestEpisode` for [9animetv.to](http://9animetv.to)
- [ ] For route 2, add a function that gets users existing releases’ [nyaa.si](http://nyaa.si) and [9animetv.to](http://9animetv.to) urls and does “webscraping” and updates releases in DB

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
