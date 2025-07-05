package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/table"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

type model struct {
	index           int
	searchBox       textinput.Model
	resultsTable    table.Model
	results         []torrent
	selectedResult  int
	selectedModel   int
	watchHistory    list.Model
	watchedItems    []HistoryItem
	currentSearchID int
}

type torrent struct {
	title     string
	size      string
	date      string
	magnetUrl string
}

type historyItem struct {
	item HistoryItem
}

func (i historyItem) Title() string       { return i.item.Title }
func (i historyItem) Description() string { return i.item.WatchedDate }
func (i historyItem) FilterValue() string { return i.item.Title }

func main() {
	// if len(os.Getenv("DEBUG")) > 0 {
	f, err := tea.LogToFile("debug.log", "debug")
	if err != nil {
		log.Println("fatal:", err)
		os.Exit(1)
	}
	defer f.Close()
	// }

	re := lipgloss.NewRenderer(os.Stdout)

	resultsTableHeaders := []table.Column{
		{Title: "#", Width: 4},
		{Title: "Title", Width: 20},
		{Title: "Size", Width: 15},
		{Title: "Date", Width: 20},
	}
	resultsTableRows := []table.Row{}

	resultsTable := table.New(
		table.WithColumns(resultsTableHeaders),
		table.WithRows(resultsTableRows),
		table.WithWidth(lipgloss.Width(re.NewStyle().Render(""))),
		table.WithHeight(50),
	)
	resultsTable.SetStyles(table.Styles{
		Header:   re.NewStyle().Bold(true),
		Selected: re.NewStyle().Foreground(lipgloss.Color("99")).Bold(true),
	})

	searchBox := textinput.New()
	searchBox.Placeholder = "Title"
	searchBox.CharLimit = 156
	searchBox.Width = lipgloss.Width(re.NewStyle().Render(""))
	searchBox.TextStyle = re.NewStyle().Foreground(lipgloss.Color("201"))
	searchBox.Prompt = re.NewStyle().Render(" Search: ")
	searchBox.ShowSuggestions = true
	searchBox.Focus()

	history, err := getHistory()
	if err != nil {
		log.Println("Failed to load history")
	}

	var suggestions []string
	for _, item := range history {
		suggestions = append(suggestions, item.Title)
	}
	searchBox.SetSuggestions(suggestions)

	defaultList := list.New([]list.Item{}, list.NewDefaultDelegate(), 0, 0)
	defaultList.SetShowHelp(true)
	defaultList.Title = "Watch History"
	defaultList.Styles.Title = lipgloss.NewStyle().Foreground(lipgloss.Color("99")).Bold(true)

	m := model{
		index:           0,
		searchBox:       searchBox,
		resultsTable:    resultsTable,
		results:         []torrent{},
		selectedResult:  0,
		selectedModel:   0,
		watchHistory:    defaultList,
		watchedItems:    history,
		currentSearchID: 0,
	}
	p := tea.NewProgram(m, tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		log.Println("Failed to start:", err)
		os.Exit(1)
	}
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.searchBox.Width = msg.Width - 15

		widthToFill := msg.Width - 5
		iW := 5
		sW := 15
		dW := 20
		tW := widthToFill - iW - sW - dW

		m.resultsTable.SetColumns([]table.Column{
			{Title: "#", Width: iW},
			{Title: "Title", Width: tW},
			{Title: "Size", Width: sW},
			{Title: "Date", Width: dW},
		})
		m.resultsTable.SetWidth(widthToFill)

		heightToFill := msg.Height - 6
		m.resultsTable.SetHeight(heightToFill)

		m.watchHistory.SetHeight(heightToFill)
		m.watchHistory.SetWidth(widthToFill)

		return m, tea.Batch(tea.ClearScreen)
	case searchResultMsg:
		// Ignore stale search results
		if msg.id != m.currentSearchID {
			log.Println("Ignoring stale search result with ID:", msg.id, "current ID:", m.currentSearchID)
			return m, nil
		}
		
		if msg.err != nil {
			log.Println("Error searching:", msg.err)
			// Ensure search box stays focused after failed search
			m.selectedModel = 0
			m.searchBox.Focus()
			return m, nil
		}
		m.results = msg.torrents

		rows := []table.Row{}
		for i, result := range m.results {
			rows = append(rows, table.Row{
				strconv.Itoa(i),
				result.title,
				result.size,
				result.date,
				// result.magnetUrl,
			})
		}
		m.resultsTable.SetRows(rows)

	case tea.KeyMsg:
		switch msg.String() {
		case "tab":
			re := lipgloss.NewRenderer(os.Stdout)
			if m.selectedModel == 0 {
				m.selectedModel = 1
				m.searchBox.Blur()
				m.resultsTable.Focus()
				m.resultsTable.SetCursor(0)
				m.searchBox.TextStyle = re.NewStyle().Foreground(lipgloss.Color("238"))
			} else if m.selectedModel == 1 {
				m.selectedModel = 0
				m.resultsTable.Blur()
				m.searchBox.Focus()
				m.searchBox.TextStyle = re.NewStyle().Foreground(lipgloss.Color("99"))
			}
		case "q", "ctrl+c":
			return m, tea.Quit
		case "enter":
			log.Println("Enter pressed, selectedModel:", m.selectedModel)
			if m.selectedModel == 0 {
				searchTerm := m.searchBox.Value()
				m.currentSearchID++
				log.Println("Initiating search for:", searchTerm, "with ID:", m.currentSearchID)
				return m, search(searchTerm, m.currentSearchID)
			}
			if m.selectedModel == 1 {
				streamUrl, err := getStreamUrl(m.results[m.selectedResult].magnetUrl)
				if err != nil {
					log.Println("Error getting stream URL:", err)
					return m, nil
				}

				item := HistoryItem{
					Title:       m.results[m.selectedResult].title,
					MagnetUrl:   m.results[m.selectedResult].magnetUrl,
					Size:        m.results[m.selectedResult].size,
					UploadDate:  m.results[m.selectedResult].date,
					WatchedDate: time.Now().Format(time.RFC3339),
				}

				m.watchedItems = append(m.watchedItems, item)
				updateHistory(item)

				LaunchMpv(streamUrl)
			}
			if m.selectedModel == 2 {
				magnetUrl := m.watchHistory.SelectedItem().(historyItem).item.MagnetUrl

				streamUrl, err := getStreamUrl(magnetUrl)
				if err != nil {
					log.Println("Error getting stream URL:", err)
					return m, nil
				}

				LaunchMpv(streamUrl)
			}
		case "j", "down":
			if m.selectedModel == 1 {
				m.resultsTable.MoveDown(1)
				m.selectedResult = m.resultsTable.Cursor()
				return m, nil
			}
		case "k", "up":
			if m.selectedModel == 1 {
				m.resultsTable.MoveUp(1)
				m.selectedResult = m.resultsTable.Cursor()
				return m, nil
			}
		case "h":
			if m.selectedModel != 2 {
				// Blur current focus
				if m.selectedModel == 0 {
					m.searchBox.Blur()
				} else if m.selectedModel == 1 {
					m.resultsTable.Blur()
				}

				m.watchHistory.FilterInput.Focus()

				items := []list.Item{}
				for _, h := range m.watchedItems {
					items = append(items, historyItem{item: h})
				}

				m.selectedModel = 2
				m.watchHistory.SetItems(items)
				log.Println("List width:", m.watchHistory.Width())
			} else {
				// Return to search box
				m.selectedModel = 0
				m.searchBox.Focus()
			}
			return m, nil
		}

		switch m.selectedModel {
		case 0:
			m.searchBox, _ = m.searchBox.Update(msg)
		case 1:
			m.resultsTable, _ = m.resultsTable.Update(msg)
		case 2:
			m.watchHistory, _ = m.watchHistory.Update(msg)
		}
	}
	return m, nil
}

var (
	defaultModelStyle = lipgloss.NewStyle().Border(lipgloss.NormalBorder()).BorderForeground(lipgloss.Color("238"))
	focusedModelStyle = lipgloss.NewStyle().Border(lipgloss.NormalBorder()).BorderForeground(lipgloss.Color("99"))
)

func (m model) View() string {
	var s string

	if m.selectedModel == 0 {
		s += lipgloss.JoinVertical(lipgloss.Center,
			focusedModelStyle.Render(fmt.Sprintf("%4s", m.searchBox.View())),
			defaultModelStyle.Render(fmt.Sprintf("%4s", m.resultsTable.View())),
		)
	} else if m.selectedModel == 1 {
		s += lipgloss.JoinVertical(lipgloss.Center,
			defaultModelStyle.Render(fmt.Sprintf("%4s", m.searchBox.View())),
			focusedModelStyle.Render(fmt.Sprintf("%4s", m.resultsTable.View())),
		)
	} else if m.selectedModel == 2 {
		s = fmt.Sprintf("%4s", m.watchHistory.View())
	}
	return s
}

type searchResultMsg struct {
	id       int
	torrents []torrent
	err      error
}

func search(searchTerm string, searchID int) tea.Cmd {
	return tea.Cmd(func() tea.Msg {
		log.Println("Searching for:", searchTerm)

		// Use the scrape API instead of scraping directly
		apiUrl := fmt.Sprintf("https://scrape.anitrack.frixaco.com/scrape?q=%s", searchTerm)
		
		// Create HTTP client with timeout to prevent hanging
		client := &http.Client{
			Timeout: 5 * time.Second,
		}

		res, err := client.Get(apiUrl)
		if err != nil {
			log.Println("Error fetching search results:", err)
			return searchResultMsg{
				id:       searchID,
				torrents: []torrent{},
				err:      err,
			}
		}
		defer res.Body.Close()

		if res.StatusCode != 200 {
			log.Println("Error fetching search results:", res.StatusCode)
			return searchResultMsg{
				id:       searchID,
				torrents: []torrent{},
				err:      errors.New("error fetching search results"),
			}
		}

		var apiResponse struct {
			Results []struct {
				Title  string `json:"title"`
				Size   string `json:"size"`
				Date   string `json:"date"`
				Magnet string `json:"magnet"`
			} `json:"results"`
			Error string `json:"error"`
		}

		err = json.NewDecoder(res.Body).Decode(&apiResponse)
		if err != nil {
			log.Println("Error parsing API response:", err)
			return searchResultMsg{
				id:       searchID,
				torrents: []torrent{},
				err:      err,
			}
		}

		if apiResponse.Error != "" {
			log.Println("API error:", apiResponse.Error)
			return searchResultMsg{
				id:       searchID,
				torrents: []torrent{},
				err:      errors.New(apiResponse.Error),
			}
		}

		ts := []torrent{}
		for _, result := range apiResponse.Results {
			ts = append(ts, torrent{
				title:     result.Title,
				size:      result.Size,
				date:      result.Date,
				magnetUrl: result.Magnet,
			})
		}

		return searchResultMsg{
			id:       searchID,
			torrents: ts,
			err:      nil,
		}
	})
}

type TorrentFile struct{}

type TorrentDetails struct {
	InfoHash string        `json:"info_hash"`
	Files    []TorrentFile `json:"files"`
}

type TorrentInfo struct {
	Details TorrentDetails `json:"details"`
}

func getStreamUrl(magnetUrl string) (string, error) {
	var streamUrl string

	// Create HTTP client with timeout to prevent hanging
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	res, err := client.Post("https://api.anitrack.frixaco.com/torrents", "application/json", strings.NewReader(magnetUrl))
	if err != nil {
		log.Println("Error getting stream URL:", err)
		return "", err
	}
	defer res.Body.Close()

	log.Println("Torrent status", res.StatusCode, res.Status)

	switch res.StatusCode {
	// For some reason, I'm not getting 409s anymore
	// case 409:
	// 	log.Println("Torrent already exists", magnetUrl)
	// 	et := ExistingTorrents{}
	// 	err := json.NewDecoder(res.Body).Decode(&et)
	// 	if err != nil {
	// 		log.Println("Error extracting JSON:", err)
	// 		return "", err
	// 	}

	// 	var torrent ExistingTorrent
	// 	for _, t := range et.Torrents {
	// 		if strings.Contains(magnetUrl, t.Details.InfoHash) {
	// 			torrent = t
	// 			break
	// 		}
	// 	}

	// 	res, err := http.Get("https://api.anitrack.frixaco.com/torrents/" + torrent.ID)
	// 	if err != nil {
	// 		log.Println("Error getting stream URL:", err)
	// 		return "", err
	// 	}
	// 	defer res.Body.Close()

	// 	torrentInfo := TorrentInfo{}
	// 	err = json.NewDecoder(res.Body).Decode(&torrentInfo)
	// 	if err != nil {
	// 		log.Println("Error extracting JSON:", err)
	// 		return "", err
	// 	}

	// 	infoHash := torrentInfo.Details.InfoHash
	// 	fileIdx := len(torrentInfo.Details.Files) - 1

	// 	streamUrl = "https://api.anitrack.frixaco.com/torrents/" + infoHash + "/stream/" + strconv.Itoa(fileIdx)

	case 200:
		log.Println("Torrent added", magnetUrl)

		torrentInfo := TorrentInfo{}
		err := json.NewDecoder(res.Body).Decode(&torrentInfo)
		if err != nil {
			log.Println("Error extracting JSON:", err)
			return "", err
		}

		streamUrl = "https://api.anitrack.frixaco.com/torrents/" + torrentInfo.Details.InfoHash + "/stream/" + strconv.Itoa(len(torrentInfo.Details.Files)-1)
	}

	return streamUrl, nil
}

type DB struct {
	Data []HistoryItem `json:"data"`
}

type HistoryItem struct {
	Title       string `json:"title"`
	MagnetUrl   string `json:"magnet_url"`
	Size        string `json:"size"`
	UploadDate  string `json:"upload_date"`
	WatchedDate string `json:"watched_date"`
}

func getHistory() ([]HistoryItem, error) {
	var db DB

	if _, err := os.Stat("db.json"); os.IsNotExist(err) {
		os.Create("db.json")
	}

	file, err := os.ReadFile("db.json")
	if err != nil {
		log.Println("Error reading history:", err)
		return []HistoryItem{}, err
	}

	json.Unmarshal(file, &db)

	return db.Data, nil
}

func updateHistory(item HistoryItem) error {
	history, err := getHistory()
	if err != nil {
		log.Println("Error updating history:", err)
		return err
	}

	history = append(history, item)

	db := DB{
		Data: history,
	}

	file, _ := json.MarshalIndent(db, "", "  ")
	return os.WriteFile("db.json", file, 0644)
}
