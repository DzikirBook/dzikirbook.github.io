/** Audio storage paths and URL resolution (single source of truth). */

export const MANIFEST_URL = "/manifest.json";

export const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".ogg", ".wav"] as const;

/** Optional override, e.g. a custom CDN with valid TLS. Empty = same origin. */
export function getAudioBaseUrl(): string {
  const configured = import.meta.env.VITE_AUDIO_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

export function encodeStorageKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

export function buildAudioUrl(storageKey: string): string {
  const encodedKey = encodeStorageKey(storageKey);
  const base = getAudioBaseUrl();
  return base ? `${base}/${encodedKey}` : `/${encodedKey}`;
}

export function isAudioFile(path: string): boolean {
  const lower = path.toLowerCase();
  return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function formatTitleFromFilename(filename: string): string {
  const nameOnly = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  return nameOnly
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
