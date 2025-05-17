
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  duration: number;
  audioUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  coverArt?: string | null;
}

export type PlayerState = {
  currentTrack: Track | null;
  currentPlaylist: Playlist | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;
};

export type PlayerView = 'nowPlaying' | 'playlist' | 'browse';

export interface SupabaseTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  audioUrl: string;
  duration: number;
  created_at: string;
}

export interface SupabasePlaylist {
  id: string;
  name: string;
  coverArt: string | null;
  created_at: string;
}

export interface SupabasePlaylistItem {
  id: string;
  playlist_id: string;
  dzikir_id: string;
  position: number;
  created_at: string;
}
