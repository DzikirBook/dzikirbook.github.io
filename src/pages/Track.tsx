
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTrackById } from "@/lib/supabase-client";
import { Playlist, Track } from "@/lib/types";
import { useAudio } from "@/hooks/use-audio";
import AudioControls from "@/components/AudioControls";
import { BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TrackPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create a dummy playlist with just this track
  const playlist: Playlist | null = track
    ? {
        id: "single-track",
        name: track.title,
        tracks: [track],
        coverArt: track.albumArt,
      }
    : null;

  // Create a simulated player state for this single track
  const playerState = {
    currentTrack: track,
    currentPlaylist: playlist,
    isPlaying: false,
    progress: 0,
    volume: 0.8,
    isShuffle: false,
    isRepeat: false,
  };

  // Use the audio hook for playback
  const { 
    isPlaying, 
    progress, 
    duration,
    volume, 
    play, 
    pause, 
    toggle,
    seek, 
    setVolume 
  } = useAudio(track);

  // Fetch the track data
  useEffect(() => {
    const loadTrack = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const trackData = await fetchTrackById(id);
        
        if (trackData) {
          setTrack(trackData);
          // Auto-play when track is loaded
          setTimeout(() => {
            play();
          }, 1000);
        } else {
          toast({
            title: "Track Not Found",
            description: "The requested audio track could not be found.",
            variant: "destructive"
          });
          navigate('/');
        }
      } catch (error) {
        console.error("Error loading track:", error);
        toast({
          title: "Error",
          description: "Could not load the requested audio track.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTrack();
  }, [id, navigate, toast, play]);

  // Handle player controls
  const handlePlayPause = () => toggle();
  const handleSeek = (position: number) => seek(position);
  const handleVolumeChange = (value: number) => setVolume(value);
  
  // Dummy functions for controls that aren't needed in single track mode
  const noop = () => {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-player-blue/30 via-white to-player-peach/30 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-48 w-48 bg-player-blue/20 rounded-xl mb-6"></div>
          <div className="h-6 w-48 bg-player-blue/20 rounded mb-3"></div>
          <div className="h-4 w-36 bg-player-blue/20 rounded"></div>
          <p className="mt-8 text-player-text">Loading audio...</p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-player-blue/30 via-white to-player-peach/30 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Track Not Found</h1>
          <p className="mb-4">The requested audio track could not be found.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-player-blue text-white px-4 py-2 rounded-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-player-blue/30 via-white to-player-peach/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">{track.title}</h1>
          <p className="text-gray-600">{track.artist}</p>
        </div>

        <div className="album-art aspect-square w-full max-w-xs mx-auto mb-8 bg-gradient-to-br from-player-peach to-player-light rounded-xl flex items-center justify-center">
          {track.albumArt ? (
            <img 
              src={track.albumArt} 
              alt={`${track.album} cover`} 
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <BookOpen className="w-24 h-24 text-player-primary/70" />
          )}
        </div>
        
        <div className="w-full">
          <AudioControls
            playerState={{
              ...playerState,
              isPlaying,
              progress,
              volume
            }}
            onPlayPause={handlePlayPause}
            onNext={noop}
            onPrevious={noop}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onToggleShuffle={noop}
            onToggleRepeat={noop}
          />
        </div>
      </div>
    </div>
  );
};

export default TrackPage;
