package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

func PrettyPrint(jsonString string) (string, error) {
	var jsonData interface{}
	err := json.Unmarshal([]byte(jsonString), &jsonData)
	if err != nil {
		return "", err
	}

	prettyJSON, err := json.MarshalIndent(jsonData, "", "    ")
	if err != nil {
		return "", err
	}

	return string(prettyJSON), nil
}

func ExtractEpisodeSeasonNumber(title string) {
	API_KEY := os.Getenv("PERPLEXITY_API_KEY")
	url := "https://api.perplexity.ai/chat/completions"

	type Message struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}

	type Query struct {
		Model    string    `json:"model"`
		Messages []Message `json:"messages"`
	}

	baseQuery := Query{
		Model: "mistral-7b-instruct",
		Messages: []Message{
			{
				Role:    "system",
				Content: "I'll provide a filename for TV show episode that I downloaded. You have to analyze it and extract the episode number if it exists and season number if it exists. If either of them don't exist, return 0 number. Respond in JSON format between <json>s with following structure: <json> { episode: 1, season: 0 } <json>",
			},
			{
				Role:    "user",
				Content: fmt.Sprintf("Here is the filename: %s", title),
			},
		},
	}

	jsonBytes, err := json.Marshal(baseQuery)
	if err != nil {
		log.Fatal("Failed to marshal query")
	}
	jsonString := string(jsonBytes)

	payload := strings.NewReader(jsonString)

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("accept", "application/json")
	req.Header.Add("content-type", "application/json")
	req.Header.Add("authorization", fmt.Sprint("Bearer ", API_KEY))

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal("Failed to response from Perplexity")
	}

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(PrettyPrint(string(body)))

}
