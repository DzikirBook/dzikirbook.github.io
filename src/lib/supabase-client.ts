
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

// Helper function to provide CORS-friendly audio URLs
const getPublicAudioUrl = (url: string): string => {
  // If it's already a public URL, return as is
  if (url.startsWith('http') && !url.includes('supabase.co')) {
    return url;
  }
  
  // For Supabase URLs, provide a CORS-friendly version
  // First, check if this is a Supabase storage URL
  if (url.includes('supabase.co') && url.includes('storage/v1')) {
    // Instead of modifying the URL, we'll return it as is
    // The audio player will handle CORS issues by offering fallback options
    return url;
  }
  
  // Return the original URL as a last resort
  return url;
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
      artist: track.artist || 'Unknown Artist',
      album: track.album || 'Unknown Album',
      albumArt: track.albumart,
      duration: track.duration || 0,
      audioUrl: getPublicAudioUrl(track.audiourl),
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
      name: playlist.name || 'Unnamed Playlist',
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
    artist: data.artist || 'Unknown Artist',
    album: data.album || 'Unknown Album',
    albumArt: data.albumart,
    duration: data.duration || 0,
    audioUrl: getPublicAudioUrl(data.audiourl), 
  };
};
