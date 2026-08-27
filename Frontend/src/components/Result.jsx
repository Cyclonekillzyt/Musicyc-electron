import { Disc3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import sas from "../assets/sasa.png";

const Result = ({ data, list, index = 0 }) => {
  const navigate = useNavigate();
  const { playTrackList } = usePlayer();

  const title = data.title || "Unknown Title";
  const artist = data.channel || "Unknown Artist";
  const image = data.thumbnails ? data.thumbnails.default.url : sas;

  const handleClick = () => {
    // Playing from a list (search results or the local library) seeds
    // the play queue with the whole list, starting at this track, so
    // skip next/prev and shuffle have something to work with.
    playTrackList(list && list.length ? list : [data], index);
    navigate("/");
  };

  return (
    <div
      className="hifi-row p-2.5 rounded-lg flex items-center gap-3 px-3 cursor-pointer"
      onClick={handleClick}
    >
      <div
        className="relative shrink-0 rounded-full overflow-hidden size-9 flex items-center justify-center"
        style={{ border: "1.5px solid var(--brass-dark)", background: "#150e0b" }}
      >
        {data.thumbnails ? (
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <Disc3 size={16} style={{ color: "var(--brass)" }} />
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate font-medium" style={{ color: "var(--cream)" }}>
          {title}
        </p>
        <p className="hifi-eyebrow truncate normal-case tracking-normal opacity-70 text-xs">
          {artist}
        </p>
      </div>
    </div>
  );
};

export default Result;
