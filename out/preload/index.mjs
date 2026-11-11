import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
  backendUrl: () => ipcRenderer.invoke("backend-url")
});
