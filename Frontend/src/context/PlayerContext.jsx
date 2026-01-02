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
  async function playAudio(trackId) {
    const audio = audioRef.current;

    if (audio.src.includes(trackId) && !audio.paused) {
      return;
    }

    audio.pause();
    audio.src = `http://localhost:3333/stream?videoId=${trackId}`;
    audio.load();

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  }


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
        seeking, setSeeking
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};
