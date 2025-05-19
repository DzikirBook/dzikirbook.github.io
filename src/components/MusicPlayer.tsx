import React, { useState, useEffect } from 'react';
import { PlayerState, PlayerView, Track, Playlist } from '@/lib/types';
import Sidebar from './Sidebar';
import NowPlaying from './NowPlaying';
import PlaylistView from './Playlist';
import { cn } from '@/lib/utils';
import { Music, BookOpen } from 'lucide-react';
import { fetchDzikirTracks, fetchPlaylists } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from '@/hooks/use-audio';

const MusicPlayer: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<PlayerView>('nowPlaying');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentPlaylist: null,
    isPlaying: false,
    progress: 0,
    volume: 0.8,
    isShuffle: false,
    isRepeat: false,
  });

  // Use the audio hook to handle actual audio playback
  const { 
    isPlaying, 
    progress, 
    volume,
    hasError,
    errorMessage,
    play,
    pause,
    seek,
    setVolume,
    retryLoading
  } = useAudio(playerState.currentTrack, handleTrackEnded);

  // Update player state when audio state changes
  useEffect(() => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying,
      progress,
      volume
    }));
  }, [isPlaying, progress, volume]);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch tracks and playlists from Supabase
        const dzikirTracks = await fetchDzikirTracks();
        const dzikirPlaylists = await fetchPlaylists();
        
        setTracks(dzikirTracks);
        setPlaylists(dzikirPlaylists);
        
        // Set initial track and playlist if available
        if (dzikirTracks.length > 0) {
          const firstPlaylist = dzikirPlaylists.length > 0 ? dzikirPlaylists[0] : null;
          setPlayerState(prev => ({ 
            ...prev, 
            currentTrack: dzikirTracks[0],
            currentPlaylist: firstPlaylist
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load dzikir audio. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Handle track ended (auto-play next track)
  function handleTrackEnded() {
    if (playerState.isRepeat) {
      // If repeat is on, restart the same track
      seek(0);
      play();
    } else {
      // Otherwise, go to next track
      handleNext();
    }
  }

  // Player controls
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Handle retry loading when there's an error
  const handleRetryLoading = () => {
    retryLoading();
    play();
  };

  const handleNext = () => {
    if (!playerState.currentPlaylist) return;
    
    const currentIndex = playerState.currentPlaylist.tracks.findIndex(
      track => track.id === playerState.currentTrack?.id
    );
    
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % playerState.currentPlaylist.tracks.length;
    const nextTrack = playerState.currentPlaylist.tracks[nextIndex];
    
    setPlayerState(prev => ({ 
      ...prev, 
      currentTrack: nextTrack,
      progress: 0 
    }));
  };

  const handlePrevious = () => {
    if (!playerState.currentPlaylist) return;
    
    const currentIndex = playerState.currentPlaylist.tracks.findIndex(
      track => track.id === playerState.currentTrack?.id
    );
    
    if (currentIndex === -1) return;
    
    const prevIndex = currentIndex === 0 
      ? playerState.currentPlaylist.tracks.length - 1 
      : currentIndex - 1;
    
    const prevTrack = playerState.currentPlaylist.tracks[prevIndex];
    
    setPlayerState(prev => ({ 
      ...prev, 
      currentTrack: prevTrack,
      progress: 0 
    }));
  };

  const handleSeek = (position: number) => {
    seek(position);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleToggleShuffle = () => {
    setPlayerState(prev => ({ ...prev, isShuffle: !prev.isShuffle }));
  };

  const handleToggleRepeat = () => {
    setPlayerState(prev => ({ ...prev, isRepeat: !prev.isRepeat }));
  };

  const handleSelectTrack = (track: Track, playlist: Playlist) => {
    setPlayerState(prev => ({ 
      ...prev, 
      currentTrack: track,
      currentPlaylist: playlist,
      progress: 0 
    }));
    play();
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="player-container flex flex-col md:flex-row w-full h-full max-h-full overflow-hidden bg-white">
        <div className="h-full flex flex-col items-center justify-center p-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-48 w-48 bg-player-blue/20 rounded-xl mb-6"></div>
            <div className="h-6 w-48 bg-player-blue/20 rounded mb-3"></div>
            <div className="h-4 w-36 bg-player-blue/20 rounded"></div>
          </div>
          <p className="mt-8 text-player-text">Loading dzikir audio...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate view based on activeView state
  const renderView = () => {
    switch (activeView) {
      case 'nowPlaying':
        return (
          <NowPlaying
            playerState={playerState}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onToggleShuffle={handleToggleShuffle}
            onToggleRepeat={handleToggleRepeat}
            hasError={hasError}
            errorMessage={errorMessage}
            onRetryLoading={handleRetryLoading}
          />
        );
      case 'playlist':
        return (
          <PlaylistView
            playerState={playerState}
            playlists={playlists}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onToggleShuffle={handleToggleShuffle}
            onToggleRepeat={handleToggleRepeat}
            onSelectTrack={handleSelectTrack}
          />
        );
      case 'browse':
        return (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <Music className="w-16 h-16 text-player-gray mb-4" />
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-player-text text-center">
              Browse feature will be available in the next update
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "player-container flex flex-col md:flex-row w-full h-full max-h-full overflow-hidden",
      playerState.isPlaying ? "bg-white" : "bg-white"
    )}>
      <Sidebar activeView={activeView} onChangeView={setActiveView} />
      <main className="flex-1 overflow-y-auto">
        {tracks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <BookOpen className="w-16 h-16 text-player-gray mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Dzikir Found</h2>
            <p className="text-player-text text-center">
              Please add dzikir audio to your Supabase database
            </p>
          </div>
        ) : (
          renderView()
        )}
      </main>
    </div>
  );
};

export default MusicPlayer;
