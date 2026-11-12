"use strict";
const electron = require("electron");
const node_child_process = require("node:child_process");
const net = require("node:net");
const path = require("node:path");
let backend = null;
let backendPort = 0;
let quitting = false;
console.log(__dirname);
function portLibre() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}
function lancerBackend(port) {
  const args = ["--port", String(port)];
  const options = { windowsHide: true, env: { ...process.env, PYTHONUNBUFFERED: "1" } };
  let proc;
  if (electron.app.isPackaged) {
    const exe = path.join(
      process.resourcesPath,
      "backend",
      process.platform === "win32" ? "backend.exe" : "backend"
    );
    proc = node_child_process.spawn(exe, args, options);
  } else {
    const exe = path.join(electron.app.getAppPath(), "dist-backend", "backend", "backend");
    proc = node_child_process.spawn(exe, args, options);
  }
  proc.stdout?.on("data", (d) => console.log(`[backend] ${d}`));
  proc.stderr?.on("data", (d) => console.error(`[backend] ${d}`));
  proc.on("exit", (code) => {
    console.log(`[backend] arrêté (code ${code})`);
    if (!quitting) {
      electron.dialog.showErrorBox("Serveur de calcul arrêté", `Le backend s'est arrêté (code ${code}).`);
      electron.app.quit();
    }
  });
  return proc;
}
async function attendreBackend(port, timeoutMs = 3e4) {
  const debut = Date.now();
  while (Date.now() - debut < timeoutMs) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/materiaux`);
      if (r.ok) return;
    } catch {
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Le serveur de calcul ne répond pas.");
}
function arreterBackend() {
  if (!backend || backend.pid === void 0) return;
  if (process.platform === "win32") {
    node_child_process.spawnSync("taskkill", ["/pid", String(backend.pid), "/T", "/F"]);
  } else {
    backend.kill("SIGTERM");
  }
  backend = null;
}
function creerFenetre() {
  const win = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (electron.app.isPackaged) {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    win.loadURL(process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173");
  }
}
electron.app.whenReady().then(async () => {
  try {
    backendPort = await portLibre();
    console.log("port dispo : ", backendPort);
    electron.ipcMain.handle("backend-url", () => `http://127.0.0.1:${backendPort}`);
    backend = lancerBackend(backendPort);
    await attendreBackend(backendPort);
    creerFenetre();
  } catch (e) {
    electron.dialog.showErrorBox("Démarrage impossible", String(e));
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  quitting = true;
});
electron.app.on("will-quit", arreterBackend);
electron.app.on("window-all-closed", () => electron.app.quit());
