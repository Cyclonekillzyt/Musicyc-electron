# Musicyc — Vintage Hi-Fi Redesign + Dashboard

Full UI/UX redesign of the Musicyc frontend, restyled as a vintage
hi-fi receiver: walnut cabinet, brass hardware, a VU-meter teal
accent, and a spinning turntable in place of a static thumbnail.

This pass adds a **responsive dashboard layout** for large windows,
in the same visual language, while keeping the original compact
widget for small ones.

## Layout switching

`App.jsx` watches window width (`useWindowWidth` hook) and picks a
layout at an 880px breakpoint:

- **≥ 880px — Dashboard** (`layouts/DashboardShell.jsx`): a sidebar
  (Home / Search / Library / Downloads / History / Settings), a top
  bar with twin decorative VU meters and search, a scrollable main
  content column, and a right-hand "Now Playing" rail with the
  turntable, transport controls, and an "up next" preview.
- **< 880px — Compact widget** (unchanged): the original single
  centered panel, with its own height-based breakpoints
  (`hifi-hide-compact` / `hifi-hide-mini`) for very short windows.

Both layouts read from the same `PlayerContext` — switching between
them mid-session (e.g. resizing the window) doesn't interrupt
playback, queue, or search state.

## What's new since the original hifi redesign

- `hooks/useWindowWidth.js` — the width-tracking hook that drives
  the layout switch.
- `layouts/DashboardShell.jsx`, `components/Sidebar.jsx`,
  `components/TopBar.jsx`, `components/VuGauge.jsx`,
  `components/NowPlayingRail.jsx`, `components/TrackCard.jsx` —
  new dashboard-only UI.
- `pages/dashboard/*` — dashboard versions of Home, Search, Library,
  Queue, History, Downloads, and Settings. These reuse the existing
  `Result`, `Thumb`, `Description`, and `Controls` components rather
  than duplicating their logic, so playback behavior is identical to
  the compact widget.
- `context/PlayerContext.jsx` — added a capped, deduped `history`
  list (client-side only, not persisted by the Electron backend) to
  power the dashboard's Recently Played / History views.
- `components/CacheManager.jsx` — the streaming-cache size/clear
  logic was pulled out of the compact `SettingsPage` so both the
  dashboard's Settings and Downloads pages can reuse it without
  duplicating the confirm-modal flow.

## Deliberate omissions

- The reference dashboard mockup showed multiple named playlists
  ("Chill Vibes", "Workout Mix", etc.) in the sidebar. The Electron
  backend (`window.electronAPI.getPlaylist()`) only exposes one flat
  local library, so the sidebar has a single **Library** entry
  instead of fabricated playlist categories. Adding real
  multi-playlist support would be a backend change.
- No "Liked Songs" heart toggle — same reasoning: there's no backend
  endpoint to persist it, so it was left out rather than added as a
  non-persistent, session-only stand-in.
- The twin VU meters in the top bar are decorative, like the
  existing VU bars in the compact widget's `Controls` — the app
  doesn't do real audio analysis, so they sweep while something is
  playing rather than reflecting actual levels.

## Not changed

Electron IPC calls, routing logic for the compact widget, and all
existing compact-widget pages (`MusicPlayer`, `SearchPage`,
`PlaylistPage`, `QueuePage`) are functionally untouched — only
`SettingsPage` was refactored (not redesigned) to delegate to the
new shared `CacheManager` component.

## How to use

Copy this `Frontend` folder over your existing one (or diff it in),
then `npm install && npm run dev` as usual. This delivery includes a
placeholder `src/assets/sasa.png` (a solid dark square) since the
original binary asset wasn't included in what was shared — drop your
real image back in at the same path.
