import { Track, Playlist } from "./types";
import {
  MANIFEST_URL,
  buildAudioUrl,
  formatTitleFromFilename,
  isAudioFile,
} from "./audio-config";

async function fetchManifestFiles(): Promise<string[]> {
  const response = await fetch(MANIFEST_URL, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
  }

  const data: { files?: string[] } = await response.json();
  const files = data.files ?? [];
  return files.filter(isAudioFile);
}

function manifestEntryToTrack(key: string): Track {
  const filename = key.split("/").pop() || key;

  return {
    id: key,
    title: formatTitleFromFilename(filename),
    artist: "Dzikir Audio",
    album: "Dzikir Collection",
    albumArt: null,
    duration: 0,
    audioUrl: buildAudioUrl(key),
  };
}

export async function fetchDzikirTracks(): Promise<Track[]> {
  try {
    const audioFiles = await fetchManifestFiles();

    if (audioFiles.length === 0) {
      console.warn("manifest.json is empty or contains no audio files.");
    }

    return audioFiles.map(manifestEntryToTrack);
  } catch (error) {
    console.error("Error fetching tracks from manifest:", error);
    return [];
  }
}

export async function fetchPlaylists(): Promise<Playlist[]> {
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
}

export async function fetchTrackById(id: string): Promise<Track | null> {
  const tracks = await fetchDzikirTracks();
  return tracks.find((track) => track.id === id) ?? null;
}
