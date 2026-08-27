import { useRef, createContext, useContext, useState, useEffect } from "react";

const PlayerContext = createContext();

const HISTORY_LIMIT = 50;
const STALL_TIMEOUT_MS = 15000;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function trackKey(track) {
  if (!track) return null;
  return track.source === "local"
    ? `local:${track.path}`
    : `stream:${track.videoId}`;
}

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [download, setDownload] = useState(null);
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [audioSize, setAudioSize] = useState(0);
  const [playedTime, setPlayedTime] = useState("0:00");
  const [seeking, setSeeking] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  const [history, setHistory] = useState([]);

  const loadedKeyRef = useRef(null);
  const currentTrackRef = useRef(null);
  const loadingKeyRef = useRef(null);
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "error") => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const audio = audioRef.current;
    const handleError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      loadedKeyRef.current = null;
      loadingKeyRef.current = null;
      const track = currentTrackRef.current;
      const message = !track
        ? "Couldn't play this track."
        : track.source === "local"
          ? "This track is missing from your library — it may have been moved or deleted."
          : !navigator.onLine
            ? "You're offline — connect to the internet to stream this track."
            : "Couldn't play this track. It may be unavailable, or the connection dropped.";
      showToast(message);
    };
    audio.addEventListener("error", handleError);
    return () => audio.removeEventListener("error", handleError);
  }, []);
  useEffect(() => {
    const audio = audioRef.current;
    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => {
      setIsPlaying(false);
      setIsBuffering(true);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };
    const onCanPlay = () => setIsBuffering(false);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("canplay", onCanPlay);
    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  const [queue, setQueue] = useState([]);
  const [playIndex, setPlayIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState([]);
  const [repeatMode, setRepeatMode] = useState("off");

  const playIndexRef = useRef(playIndex);
  useEffect(() => {
    playIndexRef.current = playIndex;
  }, [playIndex]);

  useEffect(() => {
    if (!shuffle) return;
    const current = playIndexRef.current;
    const others = queue.map((_, i) => i).filter((i) => i !== current);
    setShuffleOrder(
      current >= 0 ? [current, ...shuffleArray(others)] : shuffleArray(others),
    );
  }, [shuffle, queue]);

  const [downloadStatus, setDownloadStatus] = useState(null);

  useEffect(() => {
    if (!window.electronAPI?.onDownloadProgress) return;
    const unsubscribe = window.electronAPI.onDownloadProgress((data) => {
      setDownloadStatus(data);

      if (data?.done) {
        fetchPlaylist();
      }
    });
    return unsubscribe;
  }, []);

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

  function recordHistory(track) {
    const key = trackKey(track);
    if (!key) return;
    setHistory((h) => {
      const withoutDupe = h.filter((t) => trackKey(t) !== key);
      return [track, ...withoutDupe].slice(0, HISTORY_LIMIT);
    });
  }

  async function playAudio(track) {
    console.log("[playAudio] called with", track?.title, track?.source);
    const audio = audioRef.current;
    const key = trackKey(track);

    if (key && loadedKeyRef.current === key) {
      return;
    }
    if (key && loadingKeyRef.current === key) {
      return;
    }
    loadingKeyRef.current = key;

    if (track.source === "stream" && !navigator.onLine) {
      showToast(
        "You're offline — connect to the internet to stream this track.",
      );
      loadingKeyRef.current = null;
      return;
    }

    recordHistory(track);
    audio.pause();
    setIsBuffering(true);

    if (track.source === "stream") {
      audio.src = `http://localhost:3333/stream?videoId=${track.videoId}`;
    }

    if (track.source === "local") {
      audio.src = `file://${track.path}`;
    }
    audio.load();

    let settled = false;
    const stallTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      audio.pause();
      setIsPlaying(false);
      setIsBuffering(false);
      loadedKeyRef.current = null;
      loadingKeyRef.current = null;
      showToast("This track never started — the source may be unavailable.");
    }, STALL_TIMEOUT_MS);

    const onFirstPlaying = () => {
      if (settled) return;
      settled = true;
      clearTimeout(stallTimer);
      loadedKeyRef.current = key;
      audio.removeEventListener("playing", onFirstPlaying);
    };
    audio.addEventListener("playing", onFirstPlaying);

    try {
      await audio.play();
    } catch (err) {
      console.error("Error playing audio:", err);
      settled = true;
      clearTimeout(stallTimer);
      audio.removeEventListener("playing", onFirstPlaying);
      setIsPlaying(false);
      setIsBuffering(false);
      loadedKeyRef.current = null;
      loadingKeyRef.current = null;
      showToast("Couldn't start playback for this track.");
    }
  }

  useEffect(() => {
    if (!currentTrack) return;
    playAudio(currentTrack);
  }, [currentTrack]);

  function togglePlayPause() {
    const audio = audioRef.current;
    if (audio.paused) {
      audio.play().catch((err) => {
        console.error("Error resuming playback:", err);
        showToast("Couldn't resume playback.");
      });
    } else {
      audio.pause();
    }
  }

  function getAdjacentIndex(direction) {
    if (queue.length === 0) return -1;
    if (repeatMode === "one" && direction === 1) return playIndex;

    if (shuffle && shuffleOrder.length === queue.length) {
      const pos = shuffleOrder.indexOf(playIndex);
      const nextPos = pos + direction;
      if (nextPos < 0) {
        return repeatMode === "all"
          ? shuffleOrder[shuffleOrder.length - 1]
          : -1;
      }
      if (nextPos >= shuffleOrder.length) {
        return repeatMode === "all" ? shuffleOrder[0] : -1;
      }
      return shuffleOrder[nextPos];
    }

    const nextIndex = playIndex + direction;
    if (nextIndex < 0) return repeatMode === "all" ? queue.length - 1 : -1;
    if (nextIndex >= queue.length) return repeatMode === "all" ? 0 : -1;
    return nextIndex;
  }

  function playQueueIndex(index) {
    if (index < 0 || index >= queue.length) return;
    setPlayIndex(index);
    setCurrentTrack(queue[index]);
  }

  function playNext() {
    const idx = getAdjacentIndex(1);
    if (idx === -1) {
      audioRef.current.pause();
      return;
    }
    playQueueIndex(idx);
  }

  function playPrev() {
    const idx = getAdjacentIndex(-1);
    if (idx === -1) {
      audioRef.current.pause();
      return;
    }
    playQueueIndex(idx);
  }

  function playTrackList(tracks, startIndex = 0) {
    setQueue(tracks);
    setPlayIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
  }

  function addToQueue(track) {
    setQueue((q) => [...q, track]);
  }

  function removeFromQueueAt(index) {
    setQueue((q) => q.filter((_, i) => i !== index));
    setPlayIndex((pi) => {
      if (index < pi) return pi - 1;
      return pi;
    });
  }

  function reorderQueue(fromIndex, toIndex) {
    setQueue((q) => {
      const next = [...q];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setPlayIndex((pi) => {
      if (fromIndex === pi) return toIndex;
      if (fromIndex < pi && toIndex >= pi) return pi - 1;
      if (fromIndex > pi && toIndex <= pi) return pi + 1;
      return pi;
    });
  }

  function toggleShuffle() {
    setShuffle((s) => !s);
  }

  function cycleRepeat() {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }

  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      playNext();
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [queue, playIndex, shuffle, shuffleOrder, repeatMode]);

  useEffect(() => {
    window.electronAPI?.reportPlaybackState?.(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (!window.electronAPI?.onMediaKey) return;
    const unsubscribe = window.electronAPI.onMediaKey((action) => {
      if (action === "playpause") togglePlayPause();
      if (action === "next") playNext();
      if (action === "previous") playPrev();
    });
    return unsubscribe;
  }, [queue, playIndex, shuffle, shuffleOrder, repeatMode]);

  async function fetchPlaylist() {
    try {
      const playlists = await window.electronAPI.getPlaylist();
      setPlaylist(playlists);
    } catch (err) {
      console.error("Failed to read local library:", err);
      showToast("Couldn't read your local library.");
    }
  }

  useEffect(() => {
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
        isBuffering,
        progress,
        setProgress,
        download,
        setDownload,
        playlist,
        setPlaylist,
        refreshPlaylist: fetchPlaylist,
        playAudio,
        togglePlayPause,
        audioSize,
        setAudioSize,
        playedTime,
        setPlayedTime,
        seeking,
        setSeeking,
        pageNumber,
        setPageNumber,
        queue,
        playIndex,
        shuffle,
        repeatMode,
        playTrackList,
        playQueueIndex,
        playNext,
        playPrev,
        addToQueue,
        removeFromQueueAt,
        reorderQueue,
        toggleShuffle,
        cycleRepeat,

        history,

        downloadStatus,

        isOnline,
        toast,
        showToast,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};
