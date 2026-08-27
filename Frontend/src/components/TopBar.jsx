import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import VuGauge from "./VuGauge";

const TopBar = () => {
  const navigate = useNavigate();
  const { isPlaying } = usePlayer();

  return (
    <header className="hifi-topbar">
      <VuGauge label="Left" active={isPlaying} />
      <div className="hifi-topbar-knob" aria-hidden="true" />
      <VuGauge label="Right" active={isPlaying} />

      <div className="hifi-topbar-search">
        <input
          type="search"
          placeholder="Search for songs, artists, albums…"
          className="hifi-tuner w-full py-2.5 px-4 pr-10"
          onClick={() => navigate("/search")}
          readOnly
        />
        <Search
          size={15}
          className="absolute top-1/2 right-3.5 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--brass)" }}
        />
      </div>
    </header>
  );
};

export default TopBar;
