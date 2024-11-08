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
	cfg.DataDir = "."

	cfg.NoUpload = true
	cfg.DisableAggressiveUpload = true
	cfg.DisableTCP = false
	cfg.DisableUTP = false
	cfg.DisableIPv6 = true
	cfg.NoDHT = false
	cfg.EstablishedConnsPerTorrent = 10
	cfg.HalfOpenConnsPerTorrent = 10

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

	// Configure piece prioritization
	videoFile.Download()

	// Set priorities for pieces
	pieceSize := tor.Info().PieceLength
	startPiece := videoFile.Offset() / pieceSize
	endPiece := (videoFile.Offset() + videoFile.Length() + pieceSize - 1) / pieceSize

	// Prioritize first pieces for faster start
	for i := startPiece; i < endPiece && i < startPiece+10; i++ {
		tor.Piece(int(i)).SetPriority(torrent.PiecePriorityNow)
	}

	reader := videoFile.NewReader()
	defer reader.Close()

	// Configure reader for streaming
	reader.SetResponsive()
	reader.SetReadahead(2 * 1024 * 1024) // 2MB readahead

	bufferedReader := bufio.NewReaderSize(reader, 16*1024)

	c.Header("Content-Type", "video/mp4")
	c.Header("Accept-Ranges", "bytes")
	c.Header("Content-Length", strconv.FormatInt(videoFile.Length(), 10))
	c.Header("Transfer-Encoding", "chunked")

	rangeHeader := c.GetHeader("Range")
	if rangeHeader != "" {
		start, end := parseRange(rangeHeader, videoFile.Length())

		_, err := reader.Seek(start, io.SeekStart)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to seek to position"})
			return
		}

		c.Status(206)
		c.Header("Content-Range", fmt.Sprintf("bytes %d-%d/%d", start, end, videoFile.Length()))
		c.Header("Content-Length", strconv.FormatInt(end-start+1, 10))

		remaining := end - start + 1
		buf := make([]byte, 16*1024)

		var bytesStreamed int64 = 0
		startTime := time.Now()

		for remaining > 0 {
			// Only read what we need
			readSize := min(int64(len(buf)), remaining)
			n, err := bufferedReader.Read(buf[:readSize])

			if n > 0 {
				bytesStreamed += int64(n)
				elapsed := time.Since(startTime).Seconds()
				speed := float64(bytesStreamed) / (1024 * 1024 * elapsed) // MB/s

				fmt.Printf("\rStreamed: %.2f MB, Speed: %.2f MB/s",
					float64(bytesStreamed)/(1024*1024),
					speed)

				_, writeErr := c.Writer.Write(buf[:n])
				if writeErr != nil {
					fmt.Printf("Write error: %v\n", writeErr)
					return
				}
				c.Writer.Flush()
				remaining -= int64(n)
			}

			if err == io.EOF {
				break
			}
			if err != nil {
				fmt.Printf("Read error: %v\n", err)
				break
			}
		}
	} else {
		c.Status(200)
		buf := make([]byte, 16*1024)

		for {
			n, err := bufferedReader.Read(buf)
			if n > 0 {
				_, writeErr := c.Writer.Write(buf[:n])
				if writeErr != nil {
					fmt.Printf("Write error: %v\n", writeErr)
					return
				}
				c.Writer.Flush()
			}

			if err == io.EOF {
				break
			}
			if err != nil {
				fmt.Printf("Read error: %v\n", err)
				break
			}
		}
	}
}

func min(a, b int64) int64 {
	if a < b {
		return a
	}
	return b
}

func main() {
	ts, err := NewTorrentServer()
	if err != nil {
		log.Fatal(err)
	}

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}
	// config.AllowOrigins = []string{"https://anitrack.frixaco.com"}
	r.Use(cors.New(config))

	r.GET("/stream", ts.streamHandler)

	r.GET("/healthcheck", func(c *gin.Context) {
		println("healthcheck")
		c.JSON(200, gin.H{"message": "OK"})
	})

	r.Run(":8080")

}
