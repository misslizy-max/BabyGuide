import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("who-lms.json")) return "growth-standards";
          if (id.includes("/node_modules/")) return "vendor";
        },
      },
    },
  },
  plugins: [
    {
      name: "offline-app-shell",
      generateBundle(_, bundle) {
        const assets = Object.keys(bundle)
          .filter((x) => !x.endsWith(".map"))
          .map((x) => "/" + x);
        const version = createHash("sha256")
          .update(JSON.stringify(bundle))
          .digest("hex")
          .slice(0, 12);
        const precache = [
          "/",
          "/manifest.webmanifest",
          "/licenses/WHO-Anthro-GPL-3.0.txt",
          "/icons/icon.svg",
          "/icons/icon-192.png",
          "/icons/icon-512.png",
          "/icons/maskable-512.png",
          "/icons/apple-touch-icon.png",
          ...assets,
        ];
        this.emitFile({
          type: "asset",
          fileName: "sw.js",
          source: readFileSync("src/service-worker.js", "utf8")
            .replace("__VERSION__", version)
            .replace("__PRECACHE__", JSON.stringify([...new Set(precache)])),
        });
      },
    },
  ],
});
