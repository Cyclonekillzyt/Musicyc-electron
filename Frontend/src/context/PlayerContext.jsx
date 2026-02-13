import { useRef, createContext, useContext, useState, useEffect } from "react";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [download, setDownload] = useState(null);
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [audioSize, setAudioSize] = useState(0);
  const [playedTime, setPlayedTime] = useState("0:00");
  const [seeking, setSeeking] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      if (!seeking) {
        const percent = (audio.currentTime / audio.duration) * 100 || 0;
        setProgress(percent);
        const seconds = Math.floor(audio.currentTime);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formatted = `${minutes}:${remainingSeconds
          .toString()
          .padStart(2, "0")}`;
        setPlayedTime(formatted);
      }
    };
    audio.addEventListener("timeupdate", updateProgress);

    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [seeking]);
  async function playAudio(track) {
    console.log(track)
    const audio = audioRef.current;

    if (audio.src.includes(track) && !audio.paused) {
      return;
    }

    audio.pause();
    if (track.source === "stream") {
      audio.src = `http://localhost:3333/stream?videoId=${track.videoId}`;
    }

    if (track.source === "local") {
      audio.src = `file://${track.path}`;
    }
    audio.load();

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  }

  useEffect(() => {
    async function fetchPlaylist() {
      const playlists = await window.electronAPI.getPlaylist();
      setPlaylist(playlists);
    }
    fetchPlaylist();
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        progress,
        setProgress,
        download,
        setDownload,
        playlist,
        setPlaylist,
        playAudio,
        audioSize,
        setAudioSize,
        playedTime,
        setPlayedTime,
        seeking,
        setSeeking,
        pageNumber,
        setPageNumber,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};
