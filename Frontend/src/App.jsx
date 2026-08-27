import { Route, Routes } from "react-router-dom"
import TitleBar from "./components/TitleBar.jsx"
import OfflineBanner from "./components/OfflineBanner.jsx"
import Toast from "./components/Toast.jsx"
import { usePlayer } from "./context/PlayerContext"
import { useWindowWidth } from "./hooks/useWindowWidth"

// Compact widget (small window) — unchanged from before
import MusicPlayer from "./pages/MusicPlayer"
import SearchPage from "./pages/SearchPage"
import PlaylistPage from "./pages/PlaylistPage.jsx"
import QueuePage from "./pages/QueuePage.jsx"
import SettingsPage from "./pages/SettingsPage.jsx"

// Dashboard (large window)
import DashboardShell from "./layouts/DashboardShell.jsx"
import HomeDashboard from "./pages/dashboard/HomeDashboard.jsx"
import LibraryDashboard from "./pages/dashboard/LibraryDashboard.jsx"
import SearchDashboard from "./pages/dashboard/SearchDashboard.jsx"
import QueueDashboard from "./pages/dashboard/QueueDashboard.jsx"
import HistoryDashboard from "./pages/dashboard/HistoryDashboard.jsx"
import DownloadsDashboard from "./pages/dashboard/DownloadsDashboard.jsx"
import SettingsDashboard from "./pages/dashboard/SettingsDashboard.jsx"

// Below this window width, the sidebar + now-playing rail no longer have
// room to breathe, so we fall back to the original compact widget layout.
const DASHBOARD_MIN_WIDTH = 880;

const App = () => {
  const { isOnline, toast } = usePlayer();
  const width = useWindowWidth();
  const isDashboard = width >= DASHBOARD_MIN_WIDTH;

  return (
    <div
      data-theme="hifi"
      className="hifi-shell h-screen w-screen overflow-hidden flex flex-col"
    >
      <TitleBar />
      {!isOnline && <OfflineBanner />}

      {isDashboard ? (
        <DashboardShell>
          <Routes>
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/search" element={<SearchDashboard />} />
            <Route path="/playlist" element={<LibraryDashboard />} />
            <Route path="/queue" element={<QueueDashboard />} />
            <Route path="/history" element={<HistoryDashboard />} />
            <Route path="/downloads" element={<DownloadsDashboard />} />
            <Route path="/settings" element={<SettingsDashboard />} />
            <Route path="*" element={<HomeDashboard />} />
          </Routes>
        </DashboardShell>
      ) : (
        <div className="flex-1 min-h-0 w-full flex flex-col justify-center items-center overflow-hidden">
          <Routes>
            <Route path="/" element={<MusicPlayer />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/playlist" element={<PlaylistPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* History/Downloads only exist in the dashboard layout — if the
                window shrinks while on one of those routes, land on the
                player instead of showing a blank screen. */}
            <Route path="*" element={<MusicPlayer />} />
          </Routes>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default App
