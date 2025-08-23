import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const baseProd = "/adhkar/";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? baseProd : "/",   // <<— clé
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Adhkâr — Compteur",
        short_name: "Adhkâr",
        start_url: mode === "production" ? baseProd : "/",
        scope: mode === "production" ? baseProd : "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          { src: `${mode === "production" ? baseProd : "/"}icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: `${mode === "production" ? baseProd : "/"}icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
}));
