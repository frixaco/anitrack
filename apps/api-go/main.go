package main

import (
	"cmp"
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"slices"
	"strconv"
	"sync"
	"time"

	"github.com/go-rod/rod"
	"github.com/go-rod/stealth"
	"github.com/gocolly/colly/v2"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/labstack/echo"

	"github.com/jackc/pgx/v5"
)

type DefaultResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type Release struct {
	Uuid                       string
	Title                      string
	UserId                     string
	IsTracking                 bool
	NyaaSourceUrl              string
	AniwaveSourceUrl           string
	NyaaUrlFirstUnwatchedEp    string
	AniwaveUrlFirstUnwatchedEp string
	LatestEpisode              int
	Season                     int
	ThumbnailUrl               string
	LastWatchedEpisode         int
	CreatedAt                  time.Time
	UpdatedAt                  time.Time
}

type WatchHistory struct {
	Uuid              string
	NyaaEpisodeUrl    string
	AniwaveEpisodeUrl string
	Season            int
	ReleaseUuid       string
	UserId            string
}

type ScrapedEpisodeData struct {
	EpisodeTitle   string
	ReleaseTitle   string
	Season         int
	EpisodeNumber  int
	NyaaMagnetUrl  string
	AniwavePageUrl string
	ThumbnailUrl   string
}

type ScrapePayload struct {
	UserId     string `json:"userId"`
	NyaaUrl    string `json:"nyaaUrl"`
	AniwaveUrl string `json:"aniwaveUrl"`
}

func scrapeNyaaForEpisodes(rp *ScrapePayload) []ScrapedEpisodeData {
	fmt.Println("GETTING NYAA EPISODES")
	c := colly.NewCollector(
		colly.MaxDepth(1),
		colly.AllowedDomains("nyaa.si"),
	)
	c.WithTransport(&http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	})

	var title string
	var episodeNumbers []int

	var nyaaEpisodes []ScrapedEpisodeData

	c.OnHTML("tr", func(e *colly.HTMLElement) {
		uploadInfo := e.ChildAttr("a[href^='/view']:not([href$='#comments']):not([title*='Batch'])", "title")
		fmt.Println(uploadInfo)

		seasonEpisodePattern := regexp.MustCompile(`S(\d{2})E(\d{2})`)
		matches := seasonEpisodePattern.FindStringSubmatch(uploadInfo)
		fmt.Println(matches)
		if len(matches) < 3 {
			fmt.Println("Could not extract episode and season numbers")
			return
		}

		seasonNumber, err := strconv.Atoi(matches[1])
		if err != nil {
			log.Fatal("Could not get episode number")
		}
		episodeNumber, err := strconv.Atoi(matches[2])
		if err != nil {
			log.Fatal("Could not get episode number")
		}

		showTitlePattern := regexp.MustCompile(`\[(.*?)\]`)
		titleMatches := showTitlePattern.FindAllStringSubmatch(uploadInfo, -1)
		if len(titleMatches) < 1 {
			log.Fatal("Could not extract title")
			return
		}

		title = titleMatches[0][1]

		episode := ScrapedEpisodeData{
			ReleaseTitle:  title,
			Season:        seasonNumber,
			EpisodeNumber: episodeNumber,
			NyaaMagnetUrl: e.ChildAttr("a[href^='magnet:']", "href"),
		}

		episodeNumbers = append(episodeNumbers, episodeNumber)
		nyaaEpisodes = append(nyaaEpisodes, episode)
	})

	c.Visit(rp.NyaaUrl)

	slices.SortFunc(nyaaEpisodes, func(a, b ScrapedEpisodeData) int {
		return cmp.Compare(a.EpisodeNumber, b.EpisodeNumber)
	})

	for _, episode := range nyaaEpisodes {
		fmt.Println(episode.EpisodeNumber, " - ", episode.NyaaMagnetUrl)
	}

	fmt.Println("FINISHED GETTING EPISODES FROM NYAA.SI")
	return nyaaEpisodes
}

func getAniwaveEpisodes(rp *ScrapePayload) []ScrapedEpisodeData {
	fmt.Println("GETTING ANIWAVE EPISODES")
	var aniwaveEpisodes []ScrapedEpisodeData

	browser := rod.New().MustConnect()
	defer browser.MustClose()

	// page := browser.MustPage(rp.AniwaveUrl)
	page := stealth.MustPage(browser)
	wait := page.MustWaitNavigation()
	page.MustNavigate(rp.AniwaveUrl)
	wait()
	page.MustWaitStable()

	// html := page.MustHTML()
	// file, err := os.Create("index.html")
	// if err != nil {
	// 	log.Fatal("Error creating file:", err)
	// }
	// defer file.Close()
	//
	// _, err = file.WriteString(html)
	// if err != nil {
	// 	log.Fatal("Error writing to file:", err)
	// }

	uploadInfoEl := page.MustElement("h1.title.d-title")
	uploadInfo := uploadInfoEl.MustText()

	seasonPattern := regexp.MustCompile(`Season (\d+)`)
	matches := seasonPattern.FindStringSubmatch(uploadInfo)
	var seasonNumber int
	if len(matches) == 0 {
		seasonNumber = 1
	} else {
		if len(matches) == 1 {
			log.Fatal("Could not get season number")
		}

		seasonNumber, _ = strconv.Atoi(matches[1])
	}

	els := page.MustElements("ul.ep-range a")
	for _, el := range els {
		hrefAttr, err := el.Attribute("href")
		if err != nil {
			log.Fatal(err)
		}
		numberAttr, err := el.Attribute("data-num")
		if err != nil {
			log.Fatal(err)
		}
		number, err := strconv.Atoi(*numberAttr)
		if err != nil {
			log.Fatal(err)
		}

		imgEl := page.MustElement(".binfo .poster img")
		thumbnailUrl, err := imgEl.Attribute("src")
		if err != nil {
			log.Fatal(err)
		}

		episode := ScrapedEpisodeData{
			ReleaseTitle:   uploadInfo,
			Season:         seasonNumber,
			EpisodeNumber:  number,
			AniwavePageUrl: *hrefAttr,
			ThumbnailUrl:   *thumbnailUrl,
		}

		aniwaveEpisodes = append(aniwaveEpisodes, episode)
	}

	slices.SortFunc(aniwaveEpisodes, func(a, b ScrapedEpisodeData) int {
		return cmp.Compare(a.EpisodeNumber, b.EpisodeNumber)
	})

	for _, episode := range aniwaveEpisodes {
		fmt.Println(episode.EpisodeNumber, " - ", episode.AniwavePageUrl)
	}

	fmt.Println("FINISHED GETTING EPISODES FROM ANIWAVE.TO")
	return aniwaveEpisodes
}

func saveReleaseInDB(r *Release) error {
	return nil
	DATABASE_URL := os.Getenv("DATABASE_URL")

	conn, err := pgx.Connect(context.Background(), DATABASE_URL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer conn.Close(context.Background())

	query := `insert into anitrack_release
	   (
	     "uuid",
	     "title",
	     "user_id",
	     "nyaa_source_url",
	     "aniwave_source_url",
	     "nyaa_url_first_unwatched_ep",
	     "aniwave_url_first_unwatched_ep",
	     "latest_episode",
	     "season",
	     "thumbnail_url",
	     "last_watched_episode"
	   ) values
	     ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	 `

	_, err = conn.Exec(context.Background(), query,
		r.Uuid,
		r.Title,
		r.UserId,
		r.NyaaSourceUrl,
		r.AniwaveSourceUrl,
		r.NyaaUrlFirstUnwatchedEp,
		r.AniwaveUrlFirstUnwatchedEp,
		r.LatestEpisode,
		r.Season,
		r.ThumbnailUrl,
		r.LastWatchedEpisode,
	)
	if err != nil {
		return err
	}

	fmt.Println("Finished working with DB")

	return nil
}

func getUserReleases(userId string) ([]Release, error) {
	DATABASE_URL := os.Getenv("DATABASE_URL")

	conn, err := pgx.Connect(context.Background(), DATABASE_URL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer conn.Close(context.Background())

	query := `select 
      "uuid",
      "title",
      "user_id",
      "is_tracking",
      "nyaa_source_url",
      "aniwave_source_url",
      "nyaa_url_first_unwatched_ep",
      "aniwave_url_first_unwatched_ep",
      "latest_episode",
      "season",
      "thumbnail_url",
      "last_watched_episode",
      "created_at",
      "updated_at"
    from anitrack_release where "userId"=$1`

	dbRows, err := conn.Query(context.Background(), query, userId)
	if err != nil {
		return nil, err
	}

	var releases []Release

	defer dbRows.Close()

	for dbRows.Next() {
		var uuid string
		var title string
		var userId string
		var isTracking bool
		var nyaaSourceUrl string
		var aniwaveSourceUrl string
		var nyaaUrlFirstUnwatchedEp string
		var aniwaveUrlFirstUnwatchedEp string
		var latestEpisode int
		var season int
		var thumbnailUrl string
		var lastWatchedEpisode int
		var createdAt time.Time
		var updatedAt time.Time

		err := dbRows.Scan(
			&uuid,
			&title,
			&userId,
			&isTracking,
			&nyaaSourceUrl,
			&aniwaveSourceUrl,
			&nyaaUrlFirstUnwatchedEp,
			&aniwaveUrlFirstUnwatchedEp,
			&latestEpisode,
			&season,
			&thumbnailUrl,
			&lastWatchedEpisode,
			&createdAt,
			&updatedAt,
		)
		if err != nil {
			return nil, err
		}

		releases = append(releases, Release{
			Uuid:                       uuid,
			Title:                      title,
			UserId:                     userId,
			IsTracking:                 isTracking,
			NyaaSourceUrl:              nyaaSourceUrl,
			AniwaveSourceUrl:           aniwaveSourceUrl,
			NyaaUrlFirstUnwatchedEp:    nyaaUrlFirstUnwatchedEp,
			AniwaveUrlFirstUnwatchedEp: aniwaveUrlFirstUnwatchedEp,
			LatestEpisode:              latestEpisode,
			Season:                     season,
			ThumbnailUrl:               thumbnailUrl,
			LastWatchedEpisode:         lastWatchedEpisode,
			CreatedAt:                  createdAt,
			UpdatedAt:                  updatedAt,
		})
	}

	fmt.Println("Fetched user releases")

	return releases, nil
}

func updateReleaseInDB(r *Release) error {
	DATABASE_URL := os.Getenv("DATABASE_URL")

	conn, err := pgx.Connect(context.Background(), DATABASE_URL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer conn.Close(context.Background())

	query := `update anitrack_release
    set "latestEpisode"=$1
    where "uuid"=$2
  `

	_, err = conn.Exec(context.Background(), query, r.LatestEpisode, r.Uuid)
	if err != nil {
		return err
	}

	fmt.Println("Finished working with DB")

	return nil
}

func checkhealth(c echo.Context) error {
	fmt.Println("Checkhealth")
	type Message struct {
		Message string `json:"message"`
	}
	message := &Message{
		Message: "Hello World",
	}
	c.JSONPretty(http.StatusOK, message, "  ")
	return c.String(http.StatusOK, "Hello, World!")
}

func scrapeSources(c echo.Context) error {
	var releasePayload ScrapePayload

	err := c.Bind(&releasePayload)
	if err != nil {
		return c.String(http.StatusBadRequest, "Failed to bind request body")
	}

	fmt.Println("User ID:", releasePayload.UserId)
	fmt.Println("nyaa.si URL:", releasePayload.NyaaUrl)
	fmt.Println("aniwave.to URL:", releasePayload.AniwaveUrl)

	var nyaaEpisodes []ScrapedEpisodeData
	var aniwaveEpisodes []ScrapedEpisodeData

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		nyaaEpisodes = scrapeNyaaForEpisodes(&releasePayload)
	}()
	go func() {
		defer wg.Done()
		aniwaveEpisodes = getAniwaveEpisodes(&releasePayload)
	}()

	wg.Wait()

	latestEpisode := len(aniwaveEpisodes)
	if len(nyaaEpisodes) > len(aniwaveEpisodes) {
		latestEpisode = len(nyaaEpisodes)
	}

	uuid := uuid.New().String()
	newReleaseData := Release{
		Uuid:                       uuid,
		Title:                      aniwaveEpisodes[0].ReleaseTitle,
		LatestEpisode:              latestEpisode,
		NyaaUrlFirstUnwatchedEp:    nyaaEpisodes[0].NyaaMagnetUrl,
		AniwaveUrlFirstUnwatchedEp: aniwaveEpisodes[0].AniwavePageUrl,
		NyaaSourceUrl:              releasePayload.NyaaUrl,
		Season:                     nyaaEpisodes[0].Season,
		AniwaveSourceUrl:           releasePayload.AniwaveUrl,
		UserId:                     releasePayload.UserId,
		LastWatchedEpisode:         0,
		ThumbnailUrl:               aniwaveEpisodes[0].ThumbnailUrl,
	}
	err = saveReleaseInDB(&newReleaseData)
	if err != nil {
		log.Fatal(err)
		return err
	}

	response := &DefaultResponse{
		Success: true,
		Message: "Successfully scraped the urls and stored them in database",
	}
	return c.JSONPretty(http.StatusOK, response, "  ")
}

func syncReleases(c echo.Context) error {
	userId := c.QueryParam("userId")
	fmt.Println("User ID:", userId)

	releases, err := getUserReleases(userId)
	if err != nil {
		return err
	}

	for _, release := range releases {
		nyaaEpisodes := scrapeNyaaForEpisodes(&ScrapePayload{
			NyaaUrl:    release.NyaaSourceUrl,
			AniwaveUrl: release.AniwaveSourceUrl,
		})
		aniwaveEpisodes := getAniwaveEpisodes(&ScrapePayload{
			UserId:     release.UserId,
			NyaaUrl:    release.NyaaSourceUrl,
			AniwaveUrl: release.AniwaveSourceUrl,
		})

		latestEpisode := 1
		if len(nyaaEpisodes) > len(aniwaveEpisodes) {
			latestEpisode = len(nyaaEpisodes) - 1
		} else {
			latestEpisode = len(aniwaveEpisodes) - 1
		}

		newReleaseData := Release{
			UserId:                     userId,
			Uuid:                       release.Uuid,
			Title:                      release.Title,
			LatestEpisode:              latestEpisode,
			NyaaUrlFirstUnwatchedEp:    release.NyaaUrlFirstUnwatchedEp,
			AniwaveUrlFirstUnwatchedEp: release.AniwaveUrlFirstUnwatchedEp,
			NyaaSourceUrl:              release.NyaaSourceUrl,
			AniwaveSourceUrl:           release.AniwaveSourceUrl,
			LastWatchedEpisode:         release.LastWatchedEpisode,
		}

		err := updateReleaseInDB(&newReleaseData)
		if err != nil {
			return err
		}
	}

	response := &DefaultResponse{
		Success: true,
		Message: "Successfully checked all tracked releases for the user",
	}
	return c.JSONPretty(http.StatusOK, response, "  ")
}

func main() {
	godotenv.Load()

	port, err := strconv.Atoi(os.Getenv("PORT"))
	if err != nil {
		port = 4000
	}

	e := echo.New()
	e.GET("/checkhealth", checkhealth)

	e.POST("/scrape", scrapeSources)

	// NOTE: I already do it on the frontend. This is just in case
	e.POST("/sync", syncReleases)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%d", port)))
}
