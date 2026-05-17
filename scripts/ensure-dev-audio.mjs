/**
 * Ensures public/audio exists before Vite dev server starts.
 * Uses R2 S3 API (not the public r2.dev URL) so dev matches prod without CORS.
 */

import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const AUDIO_DIR = join("public", "audio");
const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".ogg", ".wav"];

function hasLocalAudioFiles(dir) {
  if (!existsSync(dir)) return false;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (hasLocalAudioFiles(fullPath)) return true;
      continue;
    }
    if (AUDIO_EXTENSIONS.some((ext) => entry.name.toLowerCase().endsWith(ext))) {
      return true;
    }
  }
  return false;
}

if (hasLocalAudioFiles(AUDIO_DIR)) {
  console.log("[dev] Local audio OK:", AUDIO_DIR);
  process.exit(0);
}

const hasCredentials =
  process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY;

if (hasCredentials) {
  console.log("[dev] No local audio — syncing from R2 (S3 API)...");
  const result = spawnSync("node", ["scripts/sync-audio-from-r2.mjs"], {
    stdio: "inherit",
    env: process.env,
  });
  process.exit(result.status ?? 1);
}

console.warn(`
[dev] No audio files in public/audio/

Local dev uses same-origin URLs (http://localhost:8080/audio/...) — same as production.
This is not a CORS issue; the files must exist under public/audio/.

Run once:
  R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... npm run sync:audio

Or add credentials to .env.local and run: npm run dev
`);
process.exit(0);
