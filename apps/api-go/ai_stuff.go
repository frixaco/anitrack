package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
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

func AiStuff() {
	url := "https://api.perplexity.ai/chat/completions"
	API_KEY := "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"

	// content := "Extrack episode number and season number from following anime title: [EMBER] Dosanko Gal wa Namara Menkoi S01E06 [1080p] [HEVC WEBRip] (Hokkaido Gals Are Super Adorable!). Return comma separated numbers."

	type QueryMessage struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}

	type Query struct {
		Model    string         `json:"model"`
		Messages []QueryMessage `json:"messages"`
	}

	baseQuery := Query{
		// Model: "sonar-medium-chat",
		// Model: "mistral-7b-instruct",
		Model: "sonar-small-chat",
		Messages: []QueryMessage{
			{
				Role:    "system",
				Content: "Be very precise and concise. Do not guess nor assume. Use only provided text. Always return 2 numbers with a comma between.",
			},
			// [Anime Time] One Piece - 1100 [1080p][HEVC 10bit x265][AAC][Eng Sub] [Weekly]
			{
				Role: "user",
				Content: `
            Find episode number and season number from title:
            [Anime Time] One Piece - 1100 [1080p][HEVC 10bit x265][AAC][Eng Sub] [Weekly].
            If a number is not provided, return just 0. No comments, explanations.
        `,
			},
			// {
			// 	Role: "user",
			// 	Content: `
			//          Extract episode number and season number from following anime title:
			//          [EMBER] Hokkaido Gals Are Super Adorable! (2024) (Season 1) [1080p] [Dual Audio HEVC WEBRip] (Dosanko Gal wa Na.. .
			//          Respond with ONLY two comma-separated numbers that correspond to episode and seasond number. If a corresponding number does't exist return 0.
			//      `,
			// },
			// {
			// 	Role: "user",
			// 	Content: `
			//          Extract episode number and season number from following anime title:
			//          [EMBER] Dosanko Gal wa Namara Menkoi S01E06 [1080p] [HEVC WEBRip] (Hokkaido Gals Are Super Adorable!).
			//          Respond with ONLY two comma-separated numbers that correspond to episode and seasond number. If a corresponding number does't exist return 0.
			//      `,
			// },
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
