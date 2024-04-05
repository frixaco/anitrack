package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gocolly/colly"
)

type Release struct {
	Url string `json:"url"`
}

type pageInfo struct {
	StatusCode int
	Links      map[string]int
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method is not supported.", http.StatusNotFound)
			return
		}

		// Read the body of the request
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error reading request body", http.StatusInternalServerError)
			return
		}
		defer r.Body.Close()

		// Unmarshal the JSON into the struct
		var release Release
		err = json.Unmarshal(body, &release)
		if err != nil {
			http.Error(w, "Error unmarshalling JSON", http.StatusInternalServerError)
			return
		}

		// Print the struct to the console
		fmt.Printf("Received: %+v\n", release)

		//  ==================== Colly =================
		c := colly.NewCollector(
			colly.AllowedDomains("nyaa.si", "9animetv.to"),
		)
		c.WithTransport(&http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		})

		p := &pageInfo{Links: make(map[string]int)}

		// count links
		c.OnHTML("a[href]", func(e *colly.HTMLElement) {
			link := e.Request.AbsoluteURL(e.Attr("href"))
			if link != "" {
				p.Links[link]++
			}
		})

		// extract status code
		c.OnResponse(func(r *colly.Response) {
			log.Println("response received", r.StatusCode)
			p.StatusCode = r.StatusCode
		})
		c.OnError(func(r *colly.Response, err error) {
			log.Println("error:", r.StatusCode, err)
			p.StatusCode = r.StatusCode
		})

		c.Visit(release.Url)

		// ==================================================

		fmt.Println("Links:", p.Links)

		// dump results
		b, err := json.Marshal(p)
		if err != nil {
			log.Println("failed to serialize response:", err)
			return
		}
		w.Header().Add("Content-Type", "application/json")
		w.Write(b)
	})

	log.Println("listening on", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
