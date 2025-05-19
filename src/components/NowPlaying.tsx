
import React from 'react';
import { PlayerState } from '@/lib/types';
import AudioControls from './AudioControls';
import { Music, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Function to open audio in a new tab (bypass CORS)
  const handleOpenInNewTab = () => {
    if (currentTrack?.audioUrl) {
      window.open(currentTrack.audioUrl, '_blank');
    }
  };

  if (!currentTrack) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-48 h-48 bg-gradient-to-br from-player-orange to-player-blue rounded-xl mb-6 flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-lg font-medium text-gray-600 mb-2">No Dzikir Selected</h2>
        <p className="text-sm text-player-text">Select a dzikir or Quran citation to start listening</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="album-art aspect-square w-full max-w-xs mx-auto mb-8 bg-gradient-to-br from-player-orange to-player-blue rounded-xl flex items-center justify-center">
        {currentTrack.albumArt ? (
          <img 
            src={currentTrack.albumArt} 
            alt={`${currentTrack.album} cover`} 
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <BookOpen className="w-24 h-24 text-white" />
        )}
      </div>
      
      <div className="w-full text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentTrack.title}</h2>
        <p className="text-player-text">{currentTrack.artist} • {currentTrack.album}</p>
        <Button
          variant="ghost" 
          onClick={handleOpenInNewTab}
          className="mt-2 text-xs flex items-center gap-1 mx-auto"
          size="sm"
        >
          <ExternalLink className="w-3 h-3" />
          Open in new tab
        </Button>
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
