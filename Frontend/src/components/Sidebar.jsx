import {
  Disc3,
  Download,
  History as HistoryIcon,
  Home,
  Search,
  Settings as SettingsIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/search", label: "Search", icon: Search },
  { to: "/playlist", label: "Library", icon: Disc3 },
  { to: "/downloads", label: "Downloads", icon: Download },
  { to: "/history", label: "History", icon: HistoryIcon },
];

const Sidebar = () => {
  return (
    <aside className="hifi-sidebar">
      <div className="hifi-sidebar-brand">
        <Disc3 size={22} style={{ color: "var(--brass)" }} />
        <span className="hifi-wordmark text-base">MUSICYC</span>
      </div>

      <nav className="hifi-sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `hifi-sidebar-item ${isActive ? "is-active" : ""}`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="hifi-sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `hifi-sidebar-item ${isActive ? "is-active" : ""}`
          }
        >
          <SettingsIcon size={17} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
