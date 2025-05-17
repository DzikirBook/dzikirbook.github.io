
import React from 'react';
import { cn } from '@/lib/utils';
import { SkipBack, SkipForward, Play, Pause, Volume2, Shuffle, Repeat } from 'lucide-react';
import { PlayerState } from '@/lib/types';

interface AudioControlsProps {
  playerState: PlayerState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (position: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  minimal?: boolean;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  playerState,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat,
  minimal = false,
}) => {
  const { isPlaying, progress, volume, isShuffle, isRepeat, currentTrack } = playerState;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full">
      {!minimal && currentTrack && (
        <div className="mb-3 px-1">
          <div className="track-progress">
            <div className="track-progress-bar" style={{ width: `${progress * 100}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-player-text mt-1">
            <span>{formatTime(progress * (currentTrack?.duration || 0))}</span>
            <span>{formatTime(currentTrack?.duration || 0)}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 md:gap-4">
        {!minimal && (
          <>
            <button 
              onClick={onToggleShuffle}
              className={cn(
                "control-button",
                isShuffle ? "text-player-primary" : "text-player-text"
              )}
            >
              <Shuffle size={18} />
            </button>
            
            <button onClick={onPrevious} className="control-button">
              <SkipBack size={20} />
            </button>
          </>
        )}

        <button 
          onClick={onPlayPause} 
          className={cn(
            "play-button",
            minimal ? "p-2" : "p-3"
          )}
        >
          {isPlaying ? <Pause size={minimal ? 16 : 20} /> : <Play size={minimal ? 16 : 20} />}
        </button>

        {!minimal && (
          <>
            <button onClick={onNext} className="control-button">
              <SkipForward size={20} />
            </button>
            
            <button 
              onClick={onToggleRepeat}
              className={cn(
                "control-button",
                isRepeat ? "text-player-primary" : "text-player-text"
              )}
            >
              <Repeat size={18} />
            </button>
          </>
        )}

        {!minimal && (
          <div className="flex items-center ml-2 gap-2">
            <Volume2 size={16} className="text-player-text" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 md:w-24 accent-player-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioControls;
