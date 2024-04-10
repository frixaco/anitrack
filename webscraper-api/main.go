package main

import (
	"cmp"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"slices"
	"strconv"
	"time"

	"github.com/go-rod/rod"
	"github.com/go-rod/stealth"
	"github.com/gocolly/colly"

	"github.com/jackc/pgx/v5"
)

type NewReleaseData struct {
	Id                                 string
	CreatedAt                          time.Time
	Title                              string
	LatestEpisode                      int
	LastWatchedEpisode                 int
	UserId                             string
	NyaaSourceUrl                      string
	AniwaveSourceUrl                   string
	NyaaUrlForFirstUnwatchedEpisode    string
	AniwaveUrlForFirstUnwatchedEpisode string
	ThumbnailUrl                       string
}

type NyaaEpisode struct {
	Title         string
	Season        int
	EpisodeNumber int
	MagnetUrl     string
}

type AniwaveEpisode struct {
	Title         string
	Season        int
	EpisodeNumber int
	StreamUrl     string
	ThumbnailUrl  string
}

type NewReleasePayload struct {
	UserId     string `json:"userId"`
	NyaaUrl    string `json:"nyaaUrl"`
	AniwaveUrl string `json:"aniwaveUrl"`
}

type CheckReleasesPayload struct {
	UserId string `json:"userId"`
}

type ScrapeResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func SetReponse(success bool, message string, w http.ResponseWriter, status int) {
	fmt.Println(message)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	response := ScrapeResponse{
		Success: success,
		Message: message,
	}
	rb, _ := json.Marshal(response)

	w.Write(rb)
}

func getNyaaEpisodes(rp *NewReleasePayload) []NyaaEpisode {
	c := colly.NewCollector(
		colly.MaxDepth(1),
		colly.AllowedDomains("nyaa.si", "aniwave.to"),
	)
	c.WithTransport(&http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	})

	var title string
	var episodeNumbers []int

	var nyaaEpisodes []NyaaEpisode

	c.OnHTML("tr.danger", func(e *colly.HTMLElement) {
		uploadInfo := e.ChildAttr("a[href^='/view']:not(.comments)", "title")
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

		episode := NyaaEpisode{
			Title:         title,
			Season:        seasonNumber,
			EpisodeNumber: episodeNumber,
			MagnetUrl:     e.ChildAttr("a[href^='magnet:']", "href"),
		}

		episodeNumbers = append(episodeNumbers, episodeNumber)
		nyaaEpisodes = append(nyaaEpisodes, episode)
	})

	c.Visit(rp.NyaaUrl)

	slices.SortFunc(nyaaEpisodes, func(a, b NyaaEpisode) int {
		return cmp.Compare(a.EpisodeNumber, b.EpisodeNumber)
	})

	for _, episode := range nyaaEpisodes {
		fmt.Println(episode.EpisodeNumber, " - ", episode.MagnetUrl)
	}

	return nyaaEpisodes
}

func getAniwaveEpisodes(rp *NewReleasePayload) []AniwaveEpisode {
	var aniwaveEpisodes []AniwaveEpisode

	browser := rod.New().MustConnect()
	defer browser.MustClose()

	page := stealth.MustPage(browser)
	page.MustNavigate(rp.AniwaveUrl).MustWaitStable()

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

		episode := AniwaveEpisode{
			Title:         uploadInfo,
			Season:        seasonNumber,
			EpisodeNumber: number,
			StreamUrl:     *hrefAttr,
			ThumbnailUrl:  *thumbnailUrl,
		}

		aniwaveEpisodes = append(aniwaveEpisodes, episode)
	}

	slices.SortFunc(aniwaveEpisodes, func(a, b AniwaveEpisode) int {
		return cmp.Compare(a.EpisodeNumber, b.EpisodeNumber)
	})

	for _, episode := range aniwaveEpisodes {
		fmt.Println(episode.EpisodeNumber, " - ", episode.StreamUrl)
	}

	return aniwaveEpisodes
}

func saveReleaseInDB(r *NewReleaseData) error {
	DATABASE_URL := "postgres://postgres.myevsotpzreetmmhyodr:elps1kongr0@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

	conn, err := pgx.Connect(context.Background(), DATABASE_URL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer conn.Close(context.Background())

	query := `insert into release
    (
      "latestEpisode",
      "lastWatchedEpisode",
      "title",
      "userId",
      "nyaaSourceUrl",
      "aniwaveSourceUrl",
      "nyaaUrlForFirstUnwatchedEpisode",
      "aniwaveUrlForFirstUnwatchedEpisode",
      "thumbnailUrl"
    ) values
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `

	_, err = conn.Exec(context.Background(), query,
		r.LatestEpisode,
		r.LastWatchedEpisode,
		r.Title,
		r.UserId,
		r.NyaaSourceUrl,
		r.AniwaveSourceUrl,
		r.NyaaUrlForFirstUnwatchedEpisode,
		r.AniwaveUrlForFirstUnwatchedEpisode,
		r.ThumbnailUrl,
	)
	if err != nil {
		return err
	}

	fmt.Println("Finished working with DB")

	return nil
}

func getUserReleases(userId string) ([]NewReleaseData, error) {
	DATABASE_URL := "postgres://postgres.myevsotpzreetmmhyodr:elps1kongr0@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

	conn, err := pgx.Connect(context.Background(), DATABASE_URL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer conn.Close(context.Background())

	query := `select 
      "id",
      "createdAt",
      "latestEpisode",
      "lastWatchedEpisode",
      "title",
      "nyaaSourceUrl", 
      "aniwaveSourceUrl",
      "nyaaUrlForFirstUnwatchedEpisode",
      "aniwaveUrlForFirstUnwatchedEpisode"
    from release where "userId"=$1`

	dbRows, err := conn.Query(context.Background(), query, userId)
	if err != nil {
		return nil, err
	}

	var releases []NewReleaseData

	defer dbRows.Close()

	for dbRows.Next() {
		var id string
		var createdAt time.Time
		var latestEpisode int
		var lastWatchedEpisode int
		var title string
		var nyaaSourceUrl string
		var aniwaveSourceUrl string
		var nyaaUrlForFirstUnwatchedEpisode string
		var aniwaveUrlForFirstUnwatchedEpisode string

		err := dbRows.Scan(&id, &createdAt, &latestEpisode,
			&lastWatchedEpisode, &title, &nyaaSourceUrl, &aniwaveSourceUrl, &nyaaUrlForFirstUnwatchedEpisode,
			&aniwaveUrlForFirstUnwatchedEpisode)
		if err != nil {
			return nil, err
		}

		releases = append(releases, NewReleaseData{
			Id:                                 id,
			CreatedAt:                          createdAt,
			LatestEpisode:                      latestEpisode,
			LastWatchedEpisode:                 lastWatchedEpisode,
			Title:                              title,
			NyaaSourceUrl:                      nyaaSourceUrl,
			AniwaveSourceUrl:                   aniwaveSourceUrl,
			NyaaUrlForFirstUnwatchedEpisode:    nyaaUrlForFirstUnwatchedEpisode,
			AniwaveUrlForFirstUnwatchedEpisode: aniwaveUrlForFirstUnwatchedEpisode,
		})
	}

	fmt.Println("Finished working with DB")

	return releases, nil
}

func updateReleaseInDB(r *NewReleaseData) error {
	DATABASE_URL := "postgres://postgres.myevsotpzreetmmhyodr:elps1kongr0@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

	conn, err := pgx.Connect(context.Background(), DATABASE_URL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer conn.Close(context.Background())

	query := `update release
    set "latestEpisode"=$1
    where "id"=$2
  `

	_, err = conn.Exec(context.Background(), query, r.LatestEpisode, r.Id)
	if err != nil {
		return err
	}

	fmt.Println("Finished working with DB")

	return nil
}

func main() {
	http.HandleFunc("POST /scrape", func(w http.ResponseWriter, r *http.Request) {
		var releasePayload NewReleasePayload

		b, err := io.ReadAll(r.Body)

		err = json.Unmarshal(b, &releasePayload)
		if err != nil {
			SetReponse(false, "Failed to parse request body", w, http.StatusBadRequest)
			return
		}

		fmt.Println("User ID:", releasePayload.UserId)
		fmt.Println("nyaa.si URL:", releasePayload.NyaaUrl)
		fmt.Println("aniwave.to URL:", releasePayload.AniwaveUrl)

		nyaaEpisodes := getNyaaEpisodes(&releasePayload)
		aniwaveEpisodes := getAniwaveEpisodes(&releasePayload)

		latestEpisode := len(aniwaveEpisodes)
		if len(nyaaEpisodes) > len(aniwaveEpisodes) {
			latestEpisode = len(nyaaEpisodes)
		}

		newReleaseData := NewReleaseData{
			Title:                              aniwaveEpisodes[0].Title,
			LatestEpisode:                      latestEpisode,
			NyaaUrlForFirstUnwatchedEpisode:    nyaaEpisodes[0].MagnetUrl,
			AniwaveUrlForFirstUnwatchedEpisode: aniwaveEpisodes[0].StreamUrl,
			NyaaSourceUrl:                      releasePayload.NyaaUrl,
			AniwaveSourceUrl:                   releasePayload.AniwaveUrl,
			UserId:                             releasePayload.UserId,
			LastWatchedEpisode:                 0,
			ThumbnailUrl:                       aniwaveEpisodes[0].ThumbnailUrl,
		}

		err = saveReleaseInDB(&newReleaseData)
		if err != nil {
			log.Fatal(err)
		}

		SetReponse(true, "Successfully scraped", w, http.StatusOK)
	})

	http.HandleFunc("POST /check-releases", func(w http.ResponseWriter, r *http.Request) {
		var releasePayload CheckReleasesPayload

		b, err := io.ReadAll(r.Body)

		err = json.Unmarshal(b, &releasePayload)
		if err != nil {
			SetReponse(false, "Failed to parse request body", w, http.StatusBadRequest)
			return
		}

		fmt.Println("User ID:", releasePayload.UserId)

		releases, err := getUserReleases(releasePayload.UserId)
		if err != nil {
			log.Fatal(err)
		}

		for _, release := range releases {
			nyaaEpisodes := getNyaaEpisodes(&NewReleasePayload{
				NyaaUrl:    release.NyaaSourceUrl,
				AniwaveUrl: release.AniwaveSourceUrl,
			})
			aniwaveEpisodes := getAniwaveEpisodes(&NewReleasePayload{
				NyaaUrl:    release.NyaaSourceUrl,
				AniwaveUrl: release.AniwaveSourceUrl,
			})

			latestEpisode := 1
			if len(nyaaEpisodes) > len(aniwaveEpisodes) {
				latestEpisode = len(nyaaEpisodes) - 1
			} else {
				latestEpisode = len(aniwaveEpisodes) - 1
			}

			newReleaseData := NewReleaseData{
				Id:                                 release.Id,
				Title:                              release.Title,
				LatestEpisode:                      latestEpisode,
				NyaaUrlForFirstUnwatchedEpisode:    release.NyaaUrlForFirstUnwatchedEpisode,
				AniwaveUrlForFirstUnwatchedEpisode: release.AniwaveUrlForFirstUnwatchedEpisode,
				NyaaSourceUrl:                      release.NyaaSourceUrl,
				AniwaveSourceUrl:                   release.AniwaveSourceUrl,
				LastWatchedEpisode:                 release.LastWatchedEpisode,
				UserId:                             releasePayload.UserId,
			}
			fmt.Println("T", newReleaseData.Title)
			fmt.Println("LE", newReleaseData.LatestEpisode)

			err := updateReleaseInDB(&newReleaseData)
			if err != nil {
				log.Fatal("Failed to update release in DB")
			}
		}

		SetReponse(true, fmt.Sprint("Successfully checked releases for user with ID:", releasePayload.UserId), w, http.StatusOK)
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
