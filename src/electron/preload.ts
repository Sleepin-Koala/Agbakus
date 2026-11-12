import { contextBridge, ipcRenderer } from 'electron';

console.log("tchaiii")

contextBridge.exposeInMainWorld("api", {
  backendUrl: (): Promise<string> => ipcRenderer.invoke("backend-url"),
});