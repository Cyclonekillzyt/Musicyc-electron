import { ChevronDown, Disc3, ListMusic, Search, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";

const Header = () => {
  const { pageNumber, setPageNumber } = usePlayer();
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    navigate("/search");
  };

  const playlistNavigation = (e) => {
    e.preventDefault();
    if (pageNumber === 1) {
      navigate("/playlist");
      setPageNumber(2);
    } else {
      navigate("/");
      setPageNumber(1);
    }
  };

  return (
    <div className="flex justify-between items-center gap-6 mb-8">
      <div className="flex items-center gap-2">
        <Disc3 size={20} style={{ color: "var(--brass)" }} />
        <span className="hifi-wordmark text-lg">MUSICYC</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="search"
            placeholder="Search a track…"
            className="hifi-tuner px-4 py-2 pr-10 w-56"
            onClick={(e) => handleClick(e)}
            readOnly
          />
          <Search
            size={16}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--brass)" }}
          />
        </div>

        <button
          type="button"
          className="hifi-btn-round"
          onClick={() => navigate("/queue")}
          aria-label="View play queue"
          title="Play queue"
        >
          <ListMusic size={16} />
        </button>

        <button
          type="button"
          className="hifi-btn-round"
          onClick={(e) => playlistNavigation(e)}
          aria-label={pageNumber === 1 ? "Open your collection" : "Back to player"}
          title={pageNumber === 1 ? "Open your collection" : "Back to player"}
        >
          <ChevronDown
            size={18}
            style={{
              transform: pageNumber === 1 ? "rotate(0deg)" : "rotate(180deg)",
            }}
          />
        </button>

        <button
          type="button"
          className="hifi-btn-round"
          onClick={() => navigate("/settings")}
          aria-label="Settings"
          title="Settings"
        >
          <SettingsIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export default Header;
