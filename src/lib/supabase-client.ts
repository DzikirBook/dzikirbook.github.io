
import { Track, Playlist } from "./types";

const SHARE_TOKEN = "gqrdrZMC";
const FILEBROWSER_API_URL = `https://file.drivekeluargaimam.xyz/api/public/share/${SHARE_TOKEN}`;
const FILEBROWSER_DL_URL = `https://file.drivekeluargaimam.xyz/api/public/dl/${SHARE_TOKEN}`;

// Helper function to format track titles from filenames
const formatTitleFromFilename = (filename: string): string => {
  const nameOnly = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  return nameOnly.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Fetch all dzikir audio tracks from FileBrowser directly
export const fetchDzikirTracks = async (): Promise<Track[]> => {
  try {
    const response = await fetch(FILEBROWSER_API_URL);
    if (!response.ok) throw new Error("Failed to fetch from FileBrowser");

    const data = await response.json();
    const items = data.items || [];

    // Filter only audio files and map to Track interface
    return items
      .filter((item: any) => !item.isDir && (item.type === "audio" || item.extension === ".mp3"))
      .map((item: any) => ({
        id: item.path,
        title: formatTitleFromFilename(item.name),
        artist: 'Dzikir Audio',
        album: 'Dzikir Collection',
        albumArt: null,
        duration: 0,
        audioUrl: `${FILEBROWSER_DL_URL}${item.path}?inline=true`,
      }));
  } catch (error) {
    console.error("Error fetching tracks from FileBrowser:", error);
    return [];
  }
};

// Simplified playlists: We'll create one "Semua Dzikir" playlist from the files
export const fetchPlaylists = async (): Promise<Playlist[]> => {
  const tracks = await fetchDzikirTracks();

  if (tracks.length === 0) return [];

  return [
    {
      id: "all-tracks",
      name: "Semua Dzikir",
      tracks: tracks,
      coverArt: null
    }
  ];
};

export const fetchTrackById = async (id: string): Promise<Track | null> => {
  const tracks = await fetchDzikirTracks();
  // Match path exactly
  return tracks.find(t => t.id === id || t.id === `/${id}`) || null;
};