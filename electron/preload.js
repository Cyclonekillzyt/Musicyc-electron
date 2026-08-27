const { contextBridge, ipcRenderer } = require("electron");
console.log("✅ Preload loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  sendMessage: (msg) => ipcRenderer.send("message", msg),
  onMessage: (callback) => ipcRenderer.on("message", callback),

  downloadTrack: (url) => ipcRenderer.invoke("download-track", url),
  searchYoutube: (query) => ipcRenderer.invoke("search-youtube", query),
  getPlaylist: () => ipcRenderer.invoke("current-download"),

  clearCache: () => ipcRenderer.invoke("clear-cache"),
  getCacheSize: () => ipcRenderer.invoke("get-cache-size"),

  windowMinimize: () => ipcRenderer.send("window-minimize"),
  windowClose: () => ipcRenderer.send("window-close"),

  reportPlaybackState: (isPlaying) =>
    ipcRenderer.send("playback-state", isPlaying),

  onDownloadProgress: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on("download-progress", listener);
    return () => ipcRenderer.removeListener("download-progress", listener);
  },

  onMediaKey: (callback) => {
    const listener = (_event, action) => callback(action);
    ipcRenderer.on("media-key", listener);
    return () => ipcRenderer.removeListener("media-key", listener);
  },
});
