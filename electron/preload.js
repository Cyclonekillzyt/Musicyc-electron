const { contextBridge, ipcRenderer } = require("electron");
console.log("✅ Preload loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  sendMessage: (msg) => ipcRenderer.send("message", msg),
  onMessage: (callback) => ipcRenderer.on("message", callback),
  downloadTrack: (url) => ipcRenderer.invoke("download-track", url),
  searchYoutube: (query) => ipcRenderer.invoke("search-youtube", query),
});
