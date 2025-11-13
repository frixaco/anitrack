package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type TorrentItem struct {
	Title  string `json:"title"`
	Size   string `json:"size"`
	Date   string `json:"date"`
	Magnet string `json:"magnet"`
}

type ScrapeResponse struct {
	Results []TorrentItem `json:"results"`
	Error   string        `json:"error,omitempty"`
}

func main() {
	http.HandleFunc("/scrape", handleScrape)
	http.HandleFunc("/health", handleHealth)
	
	port := "8080"
	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func handleScrape(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ScrapeResponse{Error: "Method not allowed"})
		return
	}

	query := r.URL.Query().Get("q")
	if query == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ScrapeResponse{Error: "Query parameter 'q' is required"})
		return
	}

	results, err := scrapeNyaaSubsplease(query)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ScrapeResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(ScrapeResponse{Results: results})
}

func scrapeNyaaSubsplease(query string) ([]TorrentItem, error) {
	baseURL := "https://nyaa.si/user/subsplease"
	params := url.Values{}
	params.Add("f", "0")
	params.Add("c", "0_0")
	params.Add("q", query+" 1080p")

	fullURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	var resp *http.Response
	var err error
	maxRetries := 3
	
	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt > 0 {
			backoff := time.Duration(1<<uint(attempt-1)) * time.Second
			log.Printf("Retry attempt %d after %v", attempt+1, backoff)
			time.Sleep(backoff)
		}

		req, err := http.NewRequest("GET", fullURL, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create request: %v", err)
		}
		
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

		resp, err = client.Do(req)
		if err == nil && resp.StatusCode == http.StatusOK {
			break
		}
		
		if resp != nil {
			resp.Body.Close()
		}
	}

	if err != nil {
		return nil, fmt.Errorf("failed to fetch page after %d attempts: %v", maxRetries, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %v", err)
	}

	var results []TorrentItem

	doc.Find("tr.success").Each(func(i int, s *goquery.Selection) {
		titleNode := s.Find("td:nth-child(2) a:not(.comments)").First()
		magnetNode := s.Find("a[href^=\"magnet\"]").First()
		sizeNode := s.Find("td:nth-child(4)").First()
		dateNode := s.Find("td[data-timestamp]").First()

		title := strings.TrimSpace(titleNode.Text())
		magnet, _ := magnetNode.Attr("href")
		size := strings.TrimSpace(sizeNode.Text())
		date := strings.TrimSpace(dateNode.Text())

		if title != "" && magnet != "" && size != "" && date != "" {
			results = append(results, TorrentItem{
				Title:  title,
				Size:   size,
				Date:   date,
				Magnet: magnet,
			})
		}
	})

	return results, nil
}
