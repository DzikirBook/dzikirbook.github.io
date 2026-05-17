import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { existsSync } from "fs";
import { R2_PUBLIC_URL } from "./scripts/r2-config.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const r2PublicUrl = env.VITE_R2_PUBLIC_URL || R2_PUBLIC_URL;
  const hasLocalAudio = existsSync(path.resolve(__dirname, "public/audio"));

  return {
    base: "/",
    server: {
      host: "::",
      port: 8080,
      // Fallback: proxy /audio to R2 when files are not synced locally.
      // Same-origin URLs in the app — no browser CORS. Prefer `npm run sync:audio`.
      proxy:
        mode === "development" && !hasLocalAudio
          ? {
              "/audio": {
                target: r2PublicUrl,
                changeOrigin: true,
                secure: false,
              },
            }
          : undefined,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
