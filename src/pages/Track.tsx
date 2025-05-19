
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTrackById } from "@/lib/supabase-client";
import { Playlist, Track } from "@/lib/types";
import { useAudio } from "@/hooks/use-audio";
import AudioControls from "@/components/AudioControls";
import { BookOpen, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const TrackPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

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
    hasError,
    errorMessage,
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
          console.log("Successfully loaded track data:", trackData);
          setTrack(trackData);
          // Don't autoplay - we'll wait for user interaction
          setAutoplayAttempted(false);
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
  }, [id, navigate, toast, loadAttempts]);

  // Handle player controls
  const handlePlayPause = () => toggle();
  const handleSeek = (position: number) => seek(position);
  const handleVolumeChange = (value: number) => setVolume(value);
  
  // Dummy functions for controls that aren't needed in single track mode
  const noop = () => {};

  // Manual play function that will be triggered by a button click
  const handleManualPlay = () => {
    setAutoplayAttempted(true);
    play();
  };

  // Function to retry loading the track
  const handleRetry = () => {
    setAutoplayAttempted(true);
    setLoadAttempts(prev => prev + 1); // Trigger the effect to reload the track
    play();
  };

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
        
        {/* Audio URL debug info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs overflow-hidden">
            <p className="font-mono break-all">Audio URL: {track.audioUrl}</p>
          </div>
        )}
        
        {/* Error message display */}
        {hasError && (
          <div className="text-center mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="font-medium text-red-700">Audio Error</p>
            </div>
            <p className="text-sm text-red-600 mb-3">{errorMessage || "There was a problem playing this audio"}</p>
            <Button 
              onClick={handleRetry}
              variant="destructive"
              className="px-6"
            >
              Retry
            </Button>
          </div>
        )}
        
        {!autoplayAttempted && !hasError && (
          <div className="text-center mb-6">
            <Button 
              onClick={handleManualPlay}
              className="bg-player-primary hover:bg-player-primary/90 text-white px-8 py-4"
              size="lg"
            >
              Play Audio
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Browser security requires user interaction before playing audio
            </p>
          </div>
        )}
        
        {(autoplayAttempted || hasError) && (
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
        )}
      </div>
    </div>
  );
};

export default TrackPage;
