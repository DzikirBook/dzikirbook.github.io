
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTrackById } from "@/lib/supabase-client";
import { Playlist, Track } from "@/lib/types";
import { useAudio } from "@/hooks/use-audio";
import AudioControls from "@/components/AudioControls";
import { BookOpen, AlertTriangle, ExternalLink } from "lucide-react";
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
    setVolume,
    retryLoading
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
    setLoadAttempts(prev => prev + 1);
    retryLoading();
  };

  // Function to open audio in a new tab (bypass CORS)
  const handleOpenInNewTab = () => {
    if (track?.audioUrl) {
      window.open(track.audioUrl, '_blank');
    }
  };

  // Function to go back to home
  const handleGoBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
           style={{
             background: "linear-gradient(to bottom right, rgba(244, 189, 88, 0.3), white, rgba(119, 181, 225, 0.3))"
           }}>
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-48 w-48 bg-[#77B5E1]/20 rounded-xl mb-6"></div>
          <div className="h-6 w-48 bg-[#77B5E1]/20 rounded mb-3"></div>
          <div className="h-4 w-36 bg-[#77B5E1]/20 rounded"></div>
          <p className="mt-8 text-player-text">Loading audio...</p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
           style={{
             background: "linear-gradient(to bottom right, rgba(244, 189, 88, 0.3), white, rgba(119, 181, 225, 0.3))"
           }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Track Not Found</h1>
          <p className="mb-4">The requested audio track could not be found.</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-[#77B5E1] hover:bg-[#77B5E1]/90 text-white px-4 py-2 rounded-md"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{
           background: "linear-gradient(to bottom right, rgba(244, 189, 88, 0.3), white, rgba(119, 181, 225, 0.3))"
         }}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleGoBack}
            className="text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold flex-1 text-center">{track.title}</h1>
          <div className="w-8"></div> {/* Empty div for centering */}
        </div>

        <div className="album-art aspect-square w-full max-w-xs mx-auto mb-8 bg-gradient-to-br from-[#F49359] to-[#77B5E1] rounded-xl flex items-center justify-center">
          {track.albumArt ? (
            <img 
              src={track.albumArt} 
              alt={`${track.album} cover`} 
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <BookOpen className="w-24 h-24 text-white" />
          )}
        </div>
        
        {/* Basic track info */}
        <div className="text-center mb-4">
          <p className="text-gray-600">{track.artist}</p>
          <p className="text-gray-500 text-sm">{track.album}</p>
        </div>
        
        {/* Error message display with enhanced options */}
        {hasError && (
          <div className="text-center mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="font-medium text-red-700">Audio Error</p>
            </div>
            <p className="text-sm text-red-600 mb-3">
              {errorMessage || "There was a problem playing this audio. The file might be restricted due to CORS policy."}
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleRetry}
                variant="destructive"
                className="px-6"
              >
                Retry
              </Button>
              
              <Button 
                onClick={handleOpenInNewTab}
                variant="outline"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Listen in New Tab
              </Button>
              
              <p className="text-xs text-gray-500 mt-2">
                The audio file may be restricted by CORS policy. Try accessing from a different browser or device.
              </p>
            </div>
          </div>
        )}
        
        {!autoplayAttempted && !hasError && (
          <div className="text-center mb-6">
            <Button 
              onClick={handleManualPlay}
              className="bg-[#77B5E1] hover:bg-[#77B5E1]/90 text-white px-8 py-4"
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

// Add missing import
import { ArrowLeft } from "lucide-react";

export default TrackPage;
