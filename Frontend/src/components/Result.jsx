import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";


const Result = ({ data }) => {
  const navigate = useNavigate();
  const { currentTrack, setCurrentTrack } = usePlayer();

  const title = data.title || "Unknown Title";
  const artist = data.channel || "Unknown Artist";
  const image =
    data.thumbnails.default.url ||
    "https://via.placeholder.com/150?text=No+Image";

  
  const handleClick = () => { 
    setCurrentTrack(data);
     navigate("/")
  }

  return (
    <div className="p-2 border rounded-2xl flex  items-center gap-2 px-4 transition cursor-pointer hover:bg-base-300" onClick={handleClick}>
        <img
          src={image}
          alt={title}
          className=" object-cover rounded-full"
        />

      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-gray-500">{artist}</p>
      </div>
    </div>
  );
};

export default Result;
