import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const R2_PUBLIC_URL = "https://pub-adfc2ecb0e5449b1a28b530453c3afc7.r2.dev";

export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/r2-audio': {
        target: R2_PUBLIC_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/r2-audio/, ''),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
