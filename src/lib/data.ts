
import { Playlist, Track } from "./types";

// Mock tracks
export const mockTracks: Track[] = [
  {
    id: "1",
    title: "Daydreamer",
    artist: "Aurora Waves",
    album: "Cloudscapes",
    albumArt: "https://images.unsplash.com/photo-1544656376-ffe19d4b7353?q=80&w=300&h=300&auto=format&fit=crop",
    duration: 218,
  },
  {
    id: "2",
    title: "Sunset Boulevard",
    artist: "Neon Skylines",
    album: "Evening Lights",
    albumArt: "https://images.unsplash.com/photo-1614102073832-030967418971?q=80&w=300&h=300&auto=format&fit=crop",
    duration: 184,
  },
  {
    id: "3",
    title: "Mountain Echo",
    artist: "Forest Sounds",
    album: "Nature's Call",
    albumArt: "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?q=80&w=300&h=300&auto=format&fit=crop",
    duration: 247,
  },
  {
    id: "4",
    title: "Midnight Coffee",
    artist: "Urban Jazz",
    album: "Late Hours",
    albumArt: "https://images.unsplash.com/photo-1561211974-8a5f9b63b0be?q=80&w=300&h=300&auto=format&fit=crop",
    duration: 203,
  },
  {
    id: "5",
    title: "Ocean Breeze",
    artist: "Coastal Sounds",
    album: "Seaside Dreams",
    albumArt: "https://images.unsplash.com/photo-1551224160-9bfb8fc3eaa5?q=80&w=300&h=300&auto=format&fit=crop",
    duration: 192,
  },
];

// Mock playlists
export const mockPlaylists: Playlist[] = [
  {
    id: "1",
    name: "Chill Vibes",
    tracks: [mockTracks[0], mockTracks[2], mockTracks[4]],
    coverArt: mockTracks[0].albumArt,
  },
  {
    id: "2",
    name: "Evening Mix",
    tracks: [mockTracks[1], mockTracks[3]],
    coverArt: mockTracks[1].albumArt,
  },
  {
    id: "3",
    name: "Focus Flow",
    tracks: [mockTracks[2], mockTracks[0], mockTracks[3], mockTracks[4]],
    coverArt: mockTracks[2].albumArt,
  },
];
