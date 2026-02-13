import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import sas from "../assets/sasa.png";

const Result = ({ data }) => {
  const navigate = useNavigate();
  const { currentTrack, setCurrentTrack } = usePlayer();

  const title = data.title || "Unknown Title";
  const artist = data.channel || "Unknown Artist";
  const image = data.thumbnails.default.url || sas;

  const handleClick = () => {
    setCurrentTrack(data);
    navigate("/");
  };

  return (
    <div
      className="p-2 border rounded-2xl flex  items-center gap-2 px-4 transition cursor-pointer hover:bg-base-300"
      onClick={handleClick}
    >
      <img
        src={image}
        alt={title}
        className=" object-cover rounded-full size-8"
      />

      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-gray-500">{artist}</p>
      </div>
    </div>
  );
};

export default Result;
