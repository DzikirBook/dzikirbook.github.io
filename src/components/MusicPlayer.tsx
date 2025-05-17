
import React, { useState } from 'react';
import { PlayerState, PlayerView, Track, Playlist } from '@/lib/types';
import { mockTracks, mockPlaylists } from '@/lib/data';
import Sidebar from './Sidebar';
import NowPlaying from './NowPlaying';
import PlaylistView from './Playlist';
import { cn } from '@/lib/utils';
import { Music } from 'lucide-react';

const MusicPlayer: React.FC = () => {
  const [activeView, setActiveView] = useState<PlayerView>('nowPlaying');
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: mockTracks[0],
    currentPlaylist: mockPlaylists[0],
    isPlaying: false,
    progress: 0,
    volume: 0.8,
    isShuffle: false,
    isRepeat: false,
  });

  // Player controls
  const handlePlayPause = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
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
      isPlaying: true,
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
      isPlaying: true,
      progress: 0 
    }));
  };

  const handleSeek = (position: number) => {
    setPlayerState(prev => ({ ...prev, progress: position }));
  };

  const handleVolumeChange = (volume: number) => {
    setPlayerState(prev => ({ ...prev, volume }));
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
      isPlaying: true,
      progress: 0 
    }));
  };

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
          />
        );
      case 'playlist':
        return (
          <PlaylistView
            playerState={playerState}
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
              Browse feature will be available after Supabase integration
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
        {renderView()}
      </main>
    </div>
  );
};

export default MusicPlayer;
