
import { Track, Playlist } from "./types";

// Cloudflare R2 configuration
const R2_PUBLIC_URL = "https://pub-adfc2ecb0e5449b1a28b530453c3afc7.r2.dev";
const R2_S3_API = "https://01db0a5c4608f22ceb8f11fa55504ba3.r2.cloudflarestorage.com";
const R2_AUDIO_PREFIX = "audio/";

// Helper: format a filename into a readable title
const formatTitleFromFilename = (filename: string): string => {
  const nameOnly = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  return nameOnly
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Parse S3 XML ListObjectsV2 response and return object keys
const parseS3XmlKeys = (xmlText: string): string[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const keyNodes = doc.querySelectorAll("Contents > Key");
  return Array.from(keyNodes).map((node) => node.textContent || "");
};

// Fetch all dzikir audio tracks from Cloudflare R2 via S3 XML List API
export const fetchDzikirTracks = async (): Promise<Track[]> => {
  try {
    // Use S3 ListObjectsV2 XML API (no auth needed for public buckets with list enabled)
    const listUrl = `${R2_S3_API}/?list-type=2&prefix=${encodeURIComponent(R2_AUDIO_PREFIX)}`;
    const response = await fetch(listUrl);

    if (!response.ok) {
      throw new Error(`R2 list failed: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const keys = parseS3XmlKeys(xml);

    // Filter only .mp3 files (exclude folder markers)
    const audioKeys = keys.filter((key) => key.endsWith(".mp3") || key.endsWith(".m4a") || key.endsWith(".ogg"));

    if (audioKeys.length === 0) {
      console.warn("No audio files found in R2 bucket at prefix:", R2_AUDIO_PREFIX);
    }

    return audioKeys.map((key) => {
      const filename = key.split("/").pop() || key;
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
    console.error("Error fetching tracks from Cloudflare R2:", error);
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