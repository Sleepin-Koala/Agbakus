import { app, BrowserWindow, dialog, ipcMain , Menu} from "electron";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import net from "node:net";
import path from "node:path";

let backend: ChildProcess | null = null;
let backendPort = 0;
let quitting = false;



console.log(__dirname)

// 1) Demander à l'OS un port libre (port 0 = "donne-moi n'importe lequel")
function portLibre(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address() as net.AddressInfo;
      srv.close(() => resolve(port));
    });
  });
}

// 2) Lancer le serveur : exécutable en prod, script Python en dev
function lancerBackend(port: number): ChildProcess {
  const args = ["--port", String(port)];
  const options = { windowsHide: true, env: { ...process.env, PYTHONUNBUFFERED: "1" } };
  let proc: ChildProcess;

  if (app.isPackaged) {
    const exe = path.join(
      process.resourcesPath,
      "backend",
      process.platform === "win32" ? "backend.exe" : "backend"
    );
    proc = spawn(exe, args, options);
  } else {
    // const script = path.join(app.getAppPath(), "backend", "App");
    // proc = spawn("python ", [ script, ...args], options);
    const exe = path.join(app.getAppPath(), "dist-backend", "backend","backend");
    proc = spawn(exe, args, options);

  }

  // On DOIT consommer stdout/stderr, sinon le tampon se remplit et bloque Python
  proc.stdout?.on("data", (d) => console.log(`[backend] ${d}`));
  proc.stderr?.on("data", (d) => console.error(`[backend] ${d}`));

  proc.on("exit", (code) => {
    console.log(`[backend] arrêté (code ${code})`);
    if (!quitting) {
      dialog.showErrorBox("Serveur de calcul arrêté", `Le backend s'est arrêté (code ${code}).`);
      app.quit();
    }
  });
  return proc;
}

// 3) Attendre que le serveur réponde avant d'ouvrir la fenêtre
async function attendreBackend(port: number, timeoutMs = 30000) {
  const debut = Date.now();
  while (Date.now() - debut < timeoutMs) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/materiaux`);
      if (r.ok) return;
    } catch {
      /* pas encore prêt, on réessaie */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Le serveur de calcul ne répond pas.");
}

// 4) Tuer Python (et ses éventuels sous-processus)
function arreterBackend() {
  if (!backend || backend.pid === undefined) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(backend.pid), "/T", "/F"]); // /T = tout l'arbre
  } else {
    backend.kill("SIGTERM");
  }
  backend = null;
}

function creerFenetre() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      
    },
  
  });

  // Menu.setApplicationMenu(null);

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    win.loadURL(process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173");
  }
}

app.whenReady().then(async () => {
  try {
    backendPort = await portLibre();
    console.log("port dispo : ", backendPort)

    ipcMain.handle("backend-url", () => `http://127.0.0.1:${backendPort}`);

    backend = lancerBackend(backendPort);
    await attendreBackend(backendPort);
    creerFenetre();
  } catch (e) {
    dialog.showErrorBox("Démarrage impossible", String(e));
    app.quit();
  }
});

app.on("before-quit", () => { quitting = true; });
app.on("will-quit", arreterBackend);
app.on("window-all-closed", () => app.quit());