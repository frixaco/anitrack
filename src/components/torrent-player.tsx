const TorrentPlayer = ({ magnetURI }: { magnetURI: string }) => {
  return <div>TorrentPlayer</div>;
  //   const [isClient, setIsClient] = useState(false);
  //   const [error, setError] = useState<string | null>(null);
  //   const [progress, setProgress] = useState(0);
  //   const playerRef = useRef<HTMLVideoElement | null>(null);
  //   const clientRef = useRef<any>(null);
  //   useEffect(() => {
  //     setIsClient(true);
  //     const initTorrent = async () => {
  //       try {
  //         if (!clientRef.current || !magnetURI) return;
  //         const additionalTrackers = [
  //           "wss://tracker.openwebtorrent.com",
  //           "wss://tracker.btorrent.xyz",
  //           "wss://tracker.files.fm:7073/announce",
  //           "wss://tracker.webtorrent.dev",
  //         ];
  //         console.log("Adding torrent...");
  //         const torrent = await new Promise((resolve, reject) => {
  //           const addedTorrent = clientRef.current.add(
  //             magnetURI,
  //             {
  //               announce: additionalTrackers,
  //               maxWebConns: 20,
  //             },
  //             (torrent: any) => {
  //               resolve(torrent);
  //             }
  //           );
  //           setTimeout(() => {
  //             if (!addedTorrent.ready) {
  //               reject(new Error("Torrent adding timeout"));
  //             }
  //           }, 30000);
  //         });
  //         console.log("Torrent added:", {
  //           name: torrent.name,
  //           files: torrent.files.map((f) => f.name),
  //           infoHash: torrent.infoHash,
  //           peers: torrent.numPeers,
  //         });
  //         // Find the video file
  //         const file = torrent.files.find((file: any) => {
  //           const name = file.name.toLowerCase();
  //           return (
  //             name.endsWith(".mp4") ||
  //             name.endsWith(".mkv") ||
  //             name.endsWith(".webm") ||
  //             name.endsWith(".avi")
  //           );
  //         });
  //         if (!file) {
  //           setError("No video file found in torrent");
  //           return;
  //         }
  //         console.log("Found video file:", file.name);
  //         // Create a URL for the file
  //         const fileStream = file.createReadStream();
  //         const chunks: Uint8Array[] = [];
  //         let haveData = false;
  //         fileStream.on("data", (chunk: Uint8Array) => {
  //           chunks.push(chunk);
  //           // Start playing after receiving some initial data
  //           if (!haveData && chunks.length > 0 && playerRef.current) {
  //             haveData = true;
  //             const blob = new Blob(chunks, { type: "application/octet-stream" });
  //             const url = URL.createObjectURL(blob);
  //             playerRef.current.src = url;
  //           }
  //         });
  //         // Handle stream errors
  //         fileStream.on("error", (err: Error) => {
  //           console.error("Stream error:", err);
  //           setError("Error streaming file");
  //         });
  //         // Track download progress
  //         torrent.on("download", (bytes: number) => {
  //           const progress = (torrent.progress * 100).toFixed(1);
  //           setProgress(Number(progress));
  //           console.log(`Progress: ${progress}%, Peers: ${torrent.numPeers}`);
  //           // Update video source with new data
  //           if (playerRef.current && chunks.length > 0) {
  //             const blob = new Blob(chunks, { type: "application/octet-stream" });
  //             const url = URL.createObjectURL(blob);
  //             // Save current playback position
  //             const currentTime = playerRef.current.currentTime;
  //             const wasPlaying = !playerRef.current.paused;
  //             playerRef.current.src = url;
  //             // Restore playback position and state
  //             playerRef.current.currentTime = currentTime;
  //             if (wasPlaying) {
  //               playerRef.current.play().catch(console.error);
  //             }
  //           }
  //         });
  //         torrent.on("done", () => {
  //           console.log("Torrent download complete");
  //           // Create final blob with all data
  //           if (playerRef.current && chunks.length > 0) {
  //             const blob = new Blob(chunks, { type: "application/octet-stream" });
  //             const url = URL.createObjectURL(blob);
  //             playerRef.current.src = url;
  //           }
  //         });
  //         // Handle torrent errors
  //         torrent.on("error", (err: Error) => {
  //           console.error("Torrent error:", err);
  //           setError("Error downloading torrent");
  //         });
  //         torrent.on("warning", (warn: Error) => {
  //           console.warn("Torrent warning:", warn);
  //         });
  //       } catch (err) {
  //         console.error("Initialization error:", err);
  //         setError("Failed to initialize torrent");
  //       }
  //     };
  //     const setupWebTorrent = async () => {
  //       try {
  //         const WebTorrent = (await import("../lib/webtorrent.min.js")).default;
  //         clientRef.current = new WebTorrent({
  //           tracker: {
  //             rtcConfig: {
  //               iceServers: [
  //                 { urls: "stun:stun.l.google.com:19302" },
  //                 { urls: "stun:global.stun.twilio.com:3478" },
  //               ],
  //             },
  //             announce: [
  //               "wss://tracker.openwebtorrent.com",
  //               "wss://tracker.btorrent.xyz",
  //               "wss://tracker.files.fm:7073/announce",
  //               "wss://tracker.webtorrent.dev",
  //             ],
  //           },
  //         });
  //         clientRef.current.on("error", (err: Error) => {
  //           console.error("Client error:", err);
  //           setError("Torrent client error");
  //         });
  //         await initTorrent();
  //       } catch (err) {
  //         console.error("WebTorrent setup error:", err);
  //         setError("Failed to load WebTorrent");
  //       }
  //     };
  //     setupWebTorrent();
  //     return () => {
  //       if (playerRef.current) {
  //         URL.revokeObjectURL(playerRef.current.src);
  //       }
  //       if (clientRef.current) {
  //         clientRef.current.destroy(() => {
  //           console.log("Torrent client destroyed");
  //         });
  //       }
  //     };
  //   }, [magnetURI]);
  //   const handleVideoError = (e: any) => {
  //     console.error("Video error:", e);
  //     setError(
  //       "Error playing video: " + (e.target.error?.message || "Unknown error")
  //     );
  //   };
  //   if (!isClient) return null;
  //   return (
  //     <div className="torrent-player">
  //       {error && (
  //         <div
  //           className="error-message"
  //           style={{ color: "red", marginBottom: "10px" }}
  //         >
  //           {error}
  //         </div>
  //       )}
  //       {progress > 0 && progress < 100 && (
  //         <div className="progress-bar" style={{ marginBottom: "10px" }}>
  //           Downloading: {progress.toFixed(1)}%
  //         </div>
  //       )}
  //       <video
  //         ref={playerRef}
  //         controls
  //         playsInline
  //         onError={handleVideoError}
  //         style={{ width: "100%", maxWidth: "800px" }}
  //       />
  //     </div>
  //   );
};

export default TorrentPlayer;
