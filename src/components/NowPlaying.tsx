
import React from 'react';
import { PlayerState } from '@/lib/types';
import AudioControls from './AudioControls';

interface NowPlayingProps {
  playerState: PlayerState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (position: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

const NowPlaying: React.FC<NowPlayingProps> = ({
  playerState,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat,
}) => {
  const { currentTrack, isPlaying } = playerState;

  if (!currentTrack) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-48 h-48 bg-player-gray rounded-xl mb-6 flex items-center justify-center">
          <Music className="w-16 h-16 text-player-text/50" />
        </div>
        <h2 className="text-lg font-medium text-gray-600 mb-2">No Track Selected</h2>
        <p className="text-sm text-player-text">Select a track from your playlists to start listening</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="album-art aspect-square w-full max-w-xs mx-auto mb-8">
        <img 
          src={currentTrack.albumArt} 
          alt={`${currentTrack.album} cover`} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="w-full text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentTrack.title}</h2>
        <p className="text-player-text">{currentTrack.artist} • {currentTrack.album}</p>
      </div>
      
      <div className="w-full">
        <AudioControls
          playerState={playerState}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrevious={onPrevious}
          onSeek={onSeek}
          onVolumeChange={onVolumeChange}
          onToggleShuffle={onToggleShuffle}
          onToggleRepeat={onToggleRepeat}
        />
      </div>
    </div>
  );
};

export default NowPlaying;
