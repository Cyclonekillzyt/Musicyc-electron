import { Disc3, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import sas from "../assets/sasa.png";

const TrackCard = ({ data, list, index = 0 }) => {
  const navigate = useNavigate();
  const { playTrackList } = usePlayer();

  const title = data.title || "Unknown Title";
  const artist = data.channel || "Unknown Artist";
  const image = data.thumbnails ? data.thumbnails.default.url : sas;

  const handleClick = () => {
    playTrackList(list && list.length ? list : [data], index);
    navigate("/");
  };

  return (
    <button
      type="button"
      className="hifi-card"
      onClick={handleClick}
      aria-label={`Play ${title}`}
    >
      <div className="hifi-card-art">
        {data.thumbnails ? (
          <img src={image} alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc3 size={28} style={{ color: "var(--brass)" }} />
          </div>
        )}
        <span className="hifi-card-play">
          <Play size={16} className="ml-0.5" />
        </span>
      </div>
      <p className="truncate font-medium mt-2" style={{ color: "var(--cream)" }}>
        {title}
      </p>
      <p className="hifi-eyebrow truncate normal-case tracking-normal opacity-70 text-xs">
        {artist}
      </p>
    </button>
  );
};

export default TrackCard;
