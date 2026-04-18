package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync"
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

var nyaaUsers = []string{"subsplease", "Judas", "Ember_Encodes"}

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

	results, err := scrapeNyaa(query)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ScrapeResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(ScrapeResponse{Results: results})
}

func scrapeNyaa(query string) ([]TorrentItem, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	type scrapeResult struct {
		index   int
		user    string
		results []TorrentItem
		err     error
	}

	resultCh := make(chan scrapeResult, len(nyaaUsers))
	var wg sync.WaitGroup

	for index, user := range nyaaUsers {
		wg.Add(1)
		go func(index int, user string) {
			defer wg.Done()

			results, err := scrapeNyaaUser(client, query, user)
			resultCh <- scrapeResult{
				index:   index,
				user:    user,
				results: results,
				err:     err,
			}
		}(index, user)
	}

	wg.Wait()
	close(resultCh)

	resultsByUser := make([][]TorrentItem, len(nyaaUsers))
	var successCount int
	var errors []string

	for result := range resultCh {
		if result.err != nil {
			log.Printf("scrape failed for %s: %v", result.user, result.err)
			errors = append(errors, fmt.Sprintf("%s: %v", result.user, result.err))
			continue
		}

		successCount++
		resultsByUser[result.index] = result.results
	}

	if successCount == 0 {
		return nil, fmt.Errorf("all scrapes failed: %s", strings.Join(errors, "; "))
	}

	var combined []TorrentItem
	for _, results := range resultsByUser {
		combined = append(combined, results...)
	}

	return combined, nil
}

func scrapeNyaaUser(client *http.Client, query, user string) ([]TorrentItem, error) {
	baseURL := fmt.Sprintf("https://nyaa.si/user/%s", url.PathEscape(user))
	params := url.Values{}
	params.Add("f", "0")
	params.Add("c", "0_0")
	params.Add("q", query+" 1080p")

	fullURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())
	doc, err := fetchDocument(client, fullURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch %s: %w", user, err)
	}

	var results []TorrentItem

	doc.Find("tbody tr").Each(func(i int, s *goquery.Selection) {
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

func fetchDocument(client *http.Client, targetURL string) (*goquery.Document, error) {
	var resp *http.Response
	var err error
	const maxRetries = 3

	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt > 0 {
			backoff := time.Duration(1<<uint(attempt-1)) * time.Second
			log.Printf("retry attempt %d after %v for %s", attempt+1, backoff, targetURL)
			time.Sleep(backoff)
		}

		req, reqErr := http.NewRequest("GET", targetURL, nil)
		if reqErr != nil {
			return nil, fmt.Errorf("failed to create request: %v", reqErr)
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

	if resp == nil {
		return nil, fmt.Errorf("no response received")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %v", err)
	}

	return doc, nil
}
