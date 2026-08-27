import { useNavigate } from "react-router-dom";
import Thumb from "../../components/Thumb";
import TrackCard from "../../components/TrackCard";
import { usePlayer } from "../../context/PlayerContext";

const HomeDashboard = () => {
  const navigate = useNavigate();
  const { currentTrack, history, playlist } = usePlayer();
  const thumb = currentTrack?.thumbnails?.high?.url ?? null;

  // "Recently Played" prefers actual session history; if nothing has
  // played yet this session, fall back to the local library so the
  // grid isn't empty on first launch.
  const recentlyPlayed = history.length > 0 ? history : playlist;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
        >
          Good Evening
        </h1>
        <p className="hifi-eyebrow normal-case tracking-normal opacity-70 mt-1">
          Let the music play.
        </p>
      </div>

      <div className="hifi-hero">
        <div className="hifi-hero-text">
          <p className="hifi-eyebrow mb-2">
            {currentTrack ? "Now Playing" : "Nothing Queued"}
          </p>
          <h2
            className="text-4xl leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
          >
            {currentTrack ? currentTrack.title : "Feel The Sound"}
          </h2>
          <p className="mt-3 opacity-80 max-w-sm" style={{ color: "var(--cream)" }}>
            {currentTrack
              ? currentTrack.channel || "Unknown Artist"
              : "Search for a track or pick something from your library to get started."}
          </p>
          <button
            type="button"
            className="hifi-btn-round mt-6"
            style={{ width: "auto", borderRadius: "0.6rem", padding: "0 1.4rem", height: "2.8rem" }}
            onClick={() => navigate("/search")}
          >
            <span className="text-sm tracking-wide">
              {currentTrack ? "Find Something New" : "Listen Now"}
            </span>
          </button>
        </div>

        <div className="hifi-hero-turntable">
          <Thumb pic={thumb} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-lg"
            style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
          >
            Recently Played
          </h3>
          <button
            type="button"
            className="hifi-eyebrow normal-case tracking-normal text-xs opacity-70"
            onClick={() => navigate("/history")}
          >
            View All
          </button>
        </div>

        {recentlyPlayed.length === 0 ? (
          <p className="hifi-eyebrow normal-case tracking-normal opacity-60 text-sm">
            No records on the shelf yet — try a search
          </p>
        ) : (
          <div className="hifi-grid">
            {recentlyPlayed.slice(0, 6).map((track, index) => (
              <TrackCard
                key={`${track.id || track.videoId}-${index}`}
                data={track}
                list={recentlyPlayed}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeDashboard;
