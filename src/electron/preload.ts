import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  backendUrl: (): Promise<string> => ipcRenderer.invoke("backend-url"),
});