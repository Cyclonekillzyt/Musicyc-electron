import { useState } from "react";
import { Search } from "lucide-react";
import Result from "../components/Result";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const { isOnline, showToast } = usePlayer();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (!isOnline) {
      showToast("You're offline — connect to the internet to search.");
      return;
    }

    try {
      const data = await window.electronAPI.searchYoutube(searchQuery);
      setResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      showToast(
        !navigator.onLine
          ? "You're offline — connect to the internet to search."
          : "Search failed — try again.",
      );
    }
  };

  return (
    <div className="hifi-panel h-full min-h-0 w-[92%] max-w-2xl flex flex-col my-5 items-center p-8 gap-6">
      <span className="hifi-screw hifi-screw-tl" />
      <span className="hifi-screw hifi-screw-tr" />
      <span className="hifi-screw hifi-screw-bl" />
      <span className="hifi-screw hifi-screw-br" />

      <form className="relative w-full flex items-center gap-3" onSubmit={(e) => handleSubmit(e)}>
        <button
          type="button"
          className="hifi-btn-round shrink-0"
          onClick={() => navigate("/")}
          aria-label="Back to player"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="relative flex-1">
          <input
            type="search"
            autoFocus
            placeholder="Tune in a song or artist…"
            className="hifi-tuner w-full py-3 px-5 pr-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute top-1/2 right-2 -translate-y-1/2 hifi-btn-round"
            style={{ width: "2.1rem", height: "2.1rem" }}
            aria-label="Search"
          >
            <Search size={15} />
          </button>
        </div>
      </form>

      <div className="w-full h-full overflow-y-auto flex flex-col gap-1.5 pr-1">
        {results.length === 0 ? (
          <p className="text-center mt-10 hifi-eyebrow normal-case tracking-normal opacity-60">
            No stations found yet — try a search
          </p>
        ) : (
          results.map((item, index) => (
            <Result key={index} data={item} list={results} index={index} />
          ))
        )}
      </div>
    </div>
  );
};

export default SearchPage;
