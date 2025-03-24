package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/charmbracelet/bubbles/table"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var (
	defaultModelStyle = lipgloss.NewStyle().Border(lipgloss.NormalBorder()).BorderForeground(lipgloss.Color("238"))
	focusedModelStyle = lipgloss.NewStyle().Border(lipgloss.NormalBorder()).BorderForeground(lipgloss.Color("99"))
)

type model struct {
	index          int
	searchBox      textinput.Model
	resultsTable   table.Model
	results        []torrent
	selectedResult int
	selectedModel  int
}

type torrent struct {
	title     string
	size      string
	date      string
	magnetUrl string
}

func main() {
	re := lipgloss.NewRenderer(os.Stdout)

	headers := []table.Column{
		{Title: "#", Width: 4},
		{Title: "Title", Width: 20},
		{Title: "Size", Width: 15},
		{Title: "Date", Width: 20},
		// {Title: "Magnet URL", Width: 10},
	}
	rows := []table.Row{}

	ta := table.New(
		table.WithColumns(headers),
		table.WithRows(rows),
		table.WithWidth(lipgloss.Width(re.NewStyle().Render(""))),
		table.WithHeight(50),
	)
	ta.SetStyles(table.Styles{
		Header:   re.NewStyle().Bold(true),
		Selected: re.NewStyle().Foreground(lipgloss.Color("99")).Bold(true),
	})

	ti := textinput.New()
	ti.Placeholder = "Title"
	ti.CharLimit = 156
	ti.Width = lipgloss.Width(re.NewStyle().Render(""))
	ti.TextStyle = re.NewStyle().Foreground(lipgloss.Color("99"))
	ti.Prompt = re.NewStyle().Render(" Search: ")
	ti.Focus()

	m := model{
		index:          0,
		searchBox:      ti,
		resultsTable:   ta,
		results:        []torrent{},
		selectedResult: 0,
		selectedModel:  0,
	}

	f, err := tea.LogToFile("debug.log", "debug")
	if err != nil {
		log.Println("Failed to start logging:", err)
		os.Exit(1)
	}
	defer f.Close()

	p := tea.NewProgram(m, tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		log.Println("Failed to start:", err)
		os.Exit(1)
	}
}

func (m model) Init() tea.Cmd {
	return nil
}

type searchResultMsg struct {
	torrents []torrent
	err      error
}

func search(searchTerm string) tea.Cmd {
	searchTerm = strings.ReplaceAll(searchTerm, " ", "+")

	log.Println("Searching for:", searchTerm)

	url := "https://nyaa.si/user/subsplease?f=0&c=0_0&q="
	res, err := http.Get(url + searchTerm + "+1080p")
	if err != nil {
		log.Println("Error fetching search results:", err)
		return func() tea.Msg {
			return searchResultMsg{
				torrents: []torrent{},
				err:      err,
			}
		}
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		log.Println("Error fetching search results:", res.StatusCode)
		return func() tea.Msg {
			return searchResultMsg{
				torrents: []torrent{},
				err:      errors.New("error fetching search results"),
			}
		}
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Println("Error parsing search results:", err)
		return func() tea.Msg {
			return searchResultMsg{
				torrents: []torrent{},
				err:      err,
			}
		}
	}

	ts := []torrent{}

	doc.Find("tr.success").Each(func(index int, s *goquery.Selection) {
		title := s.Find("td:nth-child(2) a:not(.comments)").Text()
		magnet := s.Find("a[href^=\"magnet\"]").AttrOr("href", "")
		size := s.Find("td:nth-child(4)").Text()
		date := s.Find("td[data-timestamp]").Text()

		ts = append(ts, torrent{
			title:     title,
			size:      size,
			date:      date,
			magnetUrl: magnet,
		})
	})

	return func() tea.Msg {
		return searchResultMsg{
			torrents: ts,
			err:      nil,
		}
	}
}

type TorrentInfo struct {
	Details TorrentDetails `json:"details"`
}

type TorrentDetails struct {
	InfoHash string        `json:"info_hash"`
	Files    []TorrentFile `json:"files"`
}

type TorrentFile struct{}

func getStreamUrl(magnetUrl string) (string, error) {
	var streamUrl string

	res, err := http.Post("https://api.anitrack.frixaco.com/torrents", "application/json", strings.NewReader(magnetUrl))
	if err != nil {
		log.Println("Error getting stream URL:", err)
		return "", err
	}
	defer res.Body.Close()

	switch res.StatusCode {
	case 409:
		// duplicate torrent
	case 200:
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

func launchMpv(magnetUrl string) {
	cmd := exec.Command("mpv", magnetUrl)
	cmd.Run()
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		log.Println("Size info:", lipgloss.Width(m.searchBox.View()))
		m.searchBox.Width = msg.Width - 15

		widthToFill := msg.Width - 5
		iW := 5
		sW := 15
		// mW := 20
		dW := 20
		tW := widthToFill - iW - sW - dW

		m.resultsTable.SetColumns([]table.Column{
			{Title: "#", Width: iW},
			{Title: "Title", Width: tW},
			{Title: "Size", Width: sW},
			{Title: "Date", Width: dW},
			// {Title: "Magnet URL", Width: mW},
		})
		m.resultsTable.SetWidth(widthToFill)

		heightToFill := msg.Height - 6
		m.resultsTable.SetHeight(heightToFill)

		return m, tea.Batch(tea.ClearScreen)
	case searchResultMsg:
		if msg.err != nil {
			log.Println("Error searching:", msg.err)
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
				m.resultsTable.Focus()
				m.resultsTable.SetCursor(0)
				m.searchBox.TextStyle = re.NewStyle().Foreground(lipgloss.Color("238"))
			} else {
				m.selectedModel = 0
				m.searchBox.Focus()
				m.searchBox.TextStyle = re.NewStyle().Foreground(lipgloss.Color("99"))
			}
		case "q", "ctrl+c":
			return m, tea.Quit
		case "enter":
			if m.selectedModel == 0 {
				return m, search(m.searchBox.Value())
			} else {
				streamUrl, err := getStreamUrl(m.results[m.selectedResult].magnetUrl)
				if err != nil {
					log.Println("Error getting stream URL:", err)
					return m, nil
				}
				launchMpv(streamUrl)
			}
		case "j", "down":
			if m.selectedModel == 1 {
				m.resultsTable.MoveDown(0)
				m.selectedResult = m.resultsTable.Cursor()
			}
		case "k", "up":
			if m.selectedModel == 1 {
				m.resultsTable.MoveUp(0)
				m.selectedResult = m.resultsTable.Cursor()
			}
		}

		switch m.selectedModel {
		case 0:
			m.searchBox, _ = m.searchBox.Update(msg)
		case 1:
			m.resultsTable, _ = m.resultsTable.Update(msg)
		}
	}
	return m, nil
}

func (m model) currentFocusedModel() string {
	if m.selectedModel == 0 {
		return "searchBox"
	}
	return "resultsTable"
}

func (m model) View() string {
	var s string

	model := m.currentFocusedModel()
	if model == "searchBox" {
		s += lipgloss.JoinVertical(lipgloss.Center,
			focusedModelStyle.Render(fmt.Sprintf("%4s", m.searchBox.View())),
			defaultModelStyle.Render(fmt.Sprintf("%4s", m.resultsTable.View())),
		)
	} else if model == "resultsTable" {
		s += lipgloss.JoinVertical(lipgloss.Center,
			defaultModelStyle.Render(fmt.Sprintf("%4s", m.searchBox.View())),
			focusedModelStyle.Render(fmt.Sprintf("%4s", m.resultsTable.View())),
		)
	}
	return s
}
