import { useState } from "react";
import { Search } from "lucide-react";
import Result from "../../components/Result";
import { usePlayer } from "../../context/PlayerContext";

const SearchDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
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
    <div className="flex flex-col gap-6">
      <div>
        <p className="hifi-eyebrow">Search</p>
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
        >
          Tune In
        </h1>
      </div>

      <form className="relative w-full max-w-xl" onSubmit={handleSubmit}>
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
      </form>

      <div className="flex flex-col gap-1.5">
        {results.length === 0 ? (
          <p className="hifi-eyebrow normal-case tracking-normal opacity-60 text-sm">
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

export default SearchDashboard;
