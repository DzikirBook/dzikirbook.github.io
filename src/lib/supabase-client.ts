
import { Track, Playlist } from "./types";

// Cloudflare R2 — public dev URL (no auth required for object access)
const R2_PUBLIC_URL = "https://pub-adfc2ecb0e5449b1a28b530453c3afc7.r2.dev";
// Audio manifest served from this site; audio files streamed from R2
const MANIFEST_URL = "/manifest.json";

// Helper: format a filename into a readable title
const formatTitleFromFilename = (filename: string): string => {
  const nameOnly = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  return nameOnly
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Fetch all dzikir audio tracks from the manifest.json hosted on R2
export const fetchDzikirTracks = async (): Promise<Track[]> => {
  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-cache" });

    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
    }

    const data: { files: string[] } = await response.json();
    const files = data.files ?? [];

    const AUDIO_EXT = [".mp3", ".m4a", ".ogg", ".wav"];
    const audioFiles = files.filter((f) => AUDIO_EXT.some((ext) => f.toLowerCase().endsWith(ext)));

    if (audioFiles.length === 0) {
      console.warn("manifest.json is empty or contains no audio files.");
    }

    return audioFiles.map((key) => {
      const filename = key.split("/").pop() || key;
      // Encode each path segment to handle spaces & special chars
      const encodedKey = key.split("/").map(encodeURIComponent).join("/");
      const audioUrl = `${R2_PUBLIC_URL}/${encodedKey}`;

      return {
        id: key,
        title: formatTitleFromFilename(filename),
        artist: "Dzikir Audio",
        album: "Dzikir Collection",
        albumArt: null,
        duration: 0,
        audioUrl,
      };
    });
  } catch (error) {
    console.error("Error fetching tracks from manifest:", error);
    return [];
  }
};

// Return a single "Semua Dzikir" playlist containing all tracks
export const fetchPlaylists = async (): Promise<Playlist[]> => {
  const tracks = await fetchDzikirTracks();

  if (tracks.length === 0) return [];

  return [
    {
      id: "all-tracks",
      name: "Semua Dzikir",
      tracks,
      coverArt: null,
    },
  ];
};

export const fetchTrackById = async (id: string): Promise<Track | null> => {
  const tracks = await fetchDzikirTracks();
  return tracks.find((t) => t.id === id) || null;
};