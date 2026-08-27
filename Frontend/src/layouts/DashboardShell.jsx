import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import NowPlayingRail from "../components/NowPlayingRail";

const DashboardShell = ({ children }) => {
  return (
    <div className="hifi-dashboard">
      <Sidebar />

      <div className="hifi-dashboard-main">
        <TopBar />
        <div className="hifi-dashboard-content">{children}</div>
      </div>

      <NowPlayingRail />
    </div>
  );
};

export default DashboardShell;
