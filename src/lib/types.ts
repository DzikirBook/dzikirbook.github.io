
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number;
  audioUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  coverArt?: string;
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
