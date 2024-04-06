package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strconv"

	"github.com/go-rod/rod"
	"github.com/go-rod/stealth"
	"github.com/gocolly/colly"
)

type NewReleaseData struct {
	Title                              string
	LatestEpisode                      int
	nyaaUrlForFirstUnwatchedEpisode    string
	aniwaveUrlForFirstUnwatchedEpisode string
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

		seasonEpisodePattern := regexp.MustCompile(`S(\d{2})E(\d{2})`)
		matches := seasonEpisodePattern.FindStringSubmatch(uploadInfo)
		if len(matches) < 3 {
			log.Fatal("Could not extract episode and season numbers")
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

		showTitlePattern := regexp.MustCompile(`\[(.*?)\`)
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
	if len(matches) < 2 {
		log.Fatal("Could not get season number")
	}
	seasonNumber, err := strconv.Atoi(matches[1])
	if err != nil {
		log.Fatal("Could not get season number")
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

		episode := AniwaveEpisode{
			Title:         uploadInfo,
			Season:        seasonNumber,
			EpisodeNumber: number,
			StreamUrl:     *hrefAttr,
		}

		aniwaveEpisodes = append(aniwaveEpisodes, episode)
	}

	for _, episode := range aniwaveEpisodes {
		fmt.Println(episode.EpisodeNumber, " - ", episode.StreamUrl)
	}

	return aniwaveEpisodes
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

		newReleaseData := NewReleaseData{
			Title: aniwaveEpisodes[0].Title,
			// Latest episode should be checked both for nyaa and aniwave
			nyaaUrlForFirstUnwatchedEpisode:    nyaaEpisodes[0].MagnetUrl,
			aniwaveUrlForFirstUnwatchedEpisode: aniwaveEpisodes[0].StreamUrl,
		}
		fmt.Println(newReleaseData)

		SetReponse(true, "Successfully scraped nyaa URL", w, http.StatusOK)
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

		SetReponse(true, fmt.Sprint("Successfully checked releases for user with ID:", releasePayload.UserId), w, http.StatusOK)
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
