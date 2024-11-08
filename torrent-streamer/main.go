package main

import (
	"fmt"
	"io"
	"log"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"bufio"

	"github.com/anacrolix/torrent"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type TorrentServer struct {
	client *torrent.Client
}

func NewTorrentServer() (*TorrentServer, error) {
	cfg := torrent.NewDefaultClientConfig()
	cfg.DataDir = "./downloads"

	client, err := torrent.NewClient(cfg)
	if err != nil {
		return nil, err
	}

	return &TorrentServer{
		client: client,
	}, nil
}

func isVideoFile(filename string) bool {
	videoExtensions := map[string]bool{
		".mp4":  true,
		".mkv":  true,
		".avi":  true,
		".mov":  true,
		".wmv":  true,
		".flv":  true,
		".webm": true,
		".m4v":  true,
		".mpeg": true,
		".mpg":  true,
	}

	ext := strings.ToLower(filepath.Ext(filename))
	return videoExtensions[ext]
}

func parseRange(rangeHeader string, fileSize int64) (int64, int64) {
	ranges := strings.Split(strings.TrimPrefix(rangeHeader, "bytes="), "-")
	if len(ranges) != 2 {
		return 0, fileSize - 1
	}

	start, err := strconv.ParseInt(ranges[0], 10, 64)
	if err != nil {
		start = 0
	}

	end, err := strconv.ParseInt(ranges[1], 10, 64)
	if err != nil || end == 0 {
		end = fileSize - 1
	}

	if start >= fileSize {
		start = 0
	}
	if end >= fileSize {
		end = fileSize - 1
	}
	if start > end {
		start, end = end, start
	}

	return start, end
}

func (ts *TorrentServer) streamHandler(c *gin.Context) {
	magnetURI := c.Query("magnet")
	if magnetURI == "" {
		c.JSON(400, gin.H{"error": "Magnet URI is required"})
		return
	}

	tor, err := ts.client.AddMagnet(magnetURI)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to add magnet"})
		return
	}

	select {
	case <-tor.GotInfo():
		fmt.Println("Got torrent info")
	case <-time.After(30 * time.Second):
		c.JSON(500, gin.H{"error": "Timeout waiting for torrent info"})
		return
	}

	fmt.Printf("Torrent name: %s\n", tor.Name())
	fmt.Printf("Torrent info hash: %s\n", tor.InfoHash().String())

	var videoFile *torrent.File
	var maxSize int64
	for _, file := range tor.Files() {
		fmt.Printf("File path: %s, size: %d\n", file.DisplayPath(), file.Length())
		if isVideoFile(file.DisplayPath()) && file.Length() > maxSize {
			videoFile = file
			maxSize = file.Length()
		}
	}

	if videoFile == nil {
		c.JSON(404, gin.H{"error": "No video file found"})
		return
	}

	reader := videoFile.NewReader()
	defer reader.Close()

	reader.SetReadahead(1 * 1024 * 1024)

	go videoFile.Download()

	bufferedReader := bufio.NewReaderSize(reader, 1024*1024) // 1MB buffer

	c.Header("Content-Type", "video/mp4")
	c.Header("Accept-Ranges", "bytes")
	c.Header("Content-Length", strconv.FormatInt(videoFile.Length(), 10))

	rangeHeader := c.GetHeader("Range")
	if rangeHeader != "" {
		start, end := parseRange(rangeHeader, videoFile.Length())

		reader.Seek(start, io.SeekStart)

		c.Status(206)
		c.Header("Content-Range", fmt.Sprintf("bytes %d-%d/%d", start, end, videoFile.Length()))
		c.Header("Content-Length", strconv.FormatInt(end-start+1, 10))

		written, err := io.CopyN(c.Writer, bufferedReader, end-start+1)
		if err != nil {
			fmt.Printf("Streaming error: %v, bytes written: %d\n", err, written)
		}
	} else {
		c.Status(200)
		written, err := io.Copy(c.Writer, bufferedReader)
		if err != nil {
			fmt.Printf("Streaming error: %v, bytes written: %d\n", err, written)
		}
	}
}

func main() {
	ts, err := NewTorrentServer()
	if err != nil {
		log.Fatal(err)
	}

	r := gin.Default()

	config := cors.DefaultConfig()
	// config.AllowOrigins = []string{"*"}
	config.AllowOrigins = []string{"https://anitrack.frixaco.com"}
	r.Use(cors.New(config))

	r.GET("/stream", ts.streamHandler)

	r.GET("/healthcheck", func(c *gin.Context) {
		println("healthcheck")
		c.JSON(200, gin.H{"message": "OK"})
	})

	r.Run(":8080")

}
