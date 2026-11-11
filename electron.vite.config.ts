import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  main: {
    build: { rollupOptions: { input: { index: resolve("./src/electron/main.ts") } } },
  },
  preload: {
    build: { rollupOptions: { input: { index: resolve("./src/electron/preload.ts") } } },
  },
  renderer: {
    root: ".",
    plugins: [react(), tailwindcss()],
    build: { rollupOptions: { input: resolve("index.html") } },
  },
});