
import { supabase } from "@/integrations/supabase/client";
import { SupabaseTrack, SupabasePlaylist, Track, Playlist } from "./types";

// Helper function to format track titles from filenames
const formatTitleFromFilename = (filename: string): string => {
  // Remove file extension and replace underscores/hyphens with spaces
  const nameOnly = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  
  // Capitalize each word
  return nameOnly.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to ensure proper URL formatting for Supabase storage
const getProperStorageUrl = (audioUrl: string | null): string => {
  if (!audioUrl) return '';
  
  // Return empty string for development/testing if needed
  // This effectively disables the direct storage URL display
  return '';
};

// Fetch all dzikir audio tracks
export const fetchDzikirTracks = async (): Promise<Track[]> => {
  const { data, error } = await supabase
    .from("dzikiraudio")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching dzikir tracks:", error);
    return [];
  }

  // Convert Supabase data to our Track interface
  return (data || []).map((track: any) => {
    // Extract filename from audioUrl for title formatting if title is missing or generic
    const filename = track.audiourl?.split('/').pop() || '';
    const title = track.title || formatTitleFromFilename(filename);
    
    return {
      id: track.id,
      title: title,
      artist: track.artist,
      album: track.album,
      albumArt: track.albumart,
      duration: track.duration,
      audioUrl: track.audiourl, // Use the original URL from the database
    };
  });
};

// Fetch all playlists
export const fetchPlaylists = async (): Promise<Playlist[]> => {
  // First get all playlists
  const { data: playlistData, error: playlistError } = await supabase
    .from("playlists")
    .select("*")
    .order("created_at", { ascending: true });

  if (playlistError) {
    console.error("Error fetching playlists:", playlistError);
    return [];
  }

  // Get all tracks
  const tracks = await fetchDzikirTracks();

  // Get all playlist items to map tracks to playlists
  const { data: playlistItems, error: itemsError } = await supabase
    .from("playlist_items")
    .select("*")
    .order("position", { ascending: true });

  if (itemsError) {
    console.error("Error fetching playlist items:", itemsError);
    return [];
  }

  // Map tracks to playlists
  return (playlistData || []).map((playlist: any) => {
    // Find all items for this playlist
    const items = playlistItems.filter(item => item.playlist_id === playlist.id);
    
    // Get the tracks for these items
    const playlistTracks = items.map(item => {
      return tracks.find(track => track.id === item.dzikir_id);
    }).filter(track => track !== undefined) as Track[];

    return {
      id: playlist.id,
      name: playlist.name,
      coverArt: playlist.coverart,
      tracks: playlistTracks,
    };
  });
};

// Get a specific track by ID (for QR code functionality)
export const fetchTrackById = async (id: string): Promise<Track | null> => {
  const { data, error } = await supabase
    .from("dzikiraudio")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.error("Error fetching track by id:", error);
    return null;
  }

  // Extract filename from audioUrl for title formatting if title is missing or generic
  const filename = data.audiourl?.split('/').pop() || '';
  const title = data.title || formatTitleFromFilename(filename);

  return {
    id: data.id,
    title: title,
    artist: data.artist,
    album: data.album,
    albumArt: data.albumart,
    duration: data.duration,
    audioUrl: data.audiourl, // Use the original URL from the database
  };
};
