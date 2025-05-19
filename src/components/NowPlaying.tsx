
import React from 'react';
import { PlayerState } from '@/lib/types';
import AudioControls from './AudioControls';
import { Music, BookOpen, ExternalLink, AlertTriangle } from 'lucide-react';
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
  onRetryLoading?: () => void;
  hasError?: boolean;
  errorMessage?: string | null;
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
  onRetryLoading,
  hasError,
  errorMessage,
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
        <div className="w-48 h-48 bg-gradient-to-br from-[#F4BD58] to-[#77B5E1] rounded-xl mb-6 flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-lg font-medium text-gray-600 mb-2">No Dzikir Selected</h2>
        <p className="text-sm text-player-text">Select a dzikir or Quran citation to start listening</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="album-art aspect-square w-full max-w-xs mx-auto mb-8 bg-gradient-to-br from-[#F4BD58] to-[#77B5E1] rounded-xl flex items-center justify-center">
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
        
        {/* Error message display */}
        {hasError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="font-medium text-red-700">Audio Error</p>
            </div>
            <p className="text-sm text-red-600 mb-3">
              {errorMessage || "There was a problem playing this audio. The file might be restricted due to CORS policy."}
            </p>
            <div className="flex flex-col gap-2">
              {onRetryLoading && (
                <Button 
                  onClick={onRetryLoading}
                  variant="destructive"
                  className="px-6"
                >
                  Retry
                </Button>
              )}
              
              <Button 
                onClick={handleOpenInNewTab}
                variant="outline"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Listen in New Tab
              </Button>
            </div>
          </div>
        )}
        
        {!hasError && (
          <Button
            variant="ghost" 
            onClick={handleOpenInNewTab}
            className="mt-2 text-xs flex items-center gap-1 mx-auto"
            size="sm"
          >
            <ExternalLink className="w-3 h-3" />
            Open in new tab
          </Button>
        )}
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
