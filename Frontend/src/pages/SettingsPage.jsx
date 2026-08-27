import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CacheManager from "../components/CacheManager.jsx";

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="hifi-panel h-full min-h-0 w-[92%] max-w-2xl flex flex-col my-5 p-8 gap-6">
      <span className="hifi-screw hifi-screw-tl" />
      <span className="hifi-screw hifi-screw-tr" />
      <span className="hifi-screw hifi-screw-bl" />
      <span className="hifi-screw hifi-screw-br" />

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          className="hifi-btn-round"
          onClick={() => navigate("/")}
          aria-label="Back to player"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <p className="hifi-eyebrow">Settings</p>
          <h1
            className="text-xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
          >
            Player Settings
          </h1>
        </div>
      </div>

      <CacheManager />
    </div>
  );
};

export default SettingsPage;
