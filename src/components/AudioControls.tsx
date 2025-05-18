import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { SkipBack, SkipForward, Play, Pause, Volume2, Shuffle, Repeat, Loader2 } from 'lucide-react';
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
  const progressRef = useRef<HTMLInputElement>(null);
  
  // Update progress bar background
  useEffect(() => {
    if (progressRef.current) {
      const percent = progress * 100;
      progressRef.current.style.backgroundImage = 
        `linear-gradient(to right, var(--player-primary) 0%, var(--player-primary) ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`;
    }
  }, [progress]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate current and total time
  const currentTime = currentTrack ? formatTime(progress * currentTrack.duration) : '0:00';
  const totalTime = currentTrack ? formatTime(currentTrack.duration) : '0:00';

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    onSeek(newProgress);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };

  return (
    <div className="w-full">
      {!minimal && currentTrack && (
        <div className="mb-3 px-1">
          <input
            ref={progressRef}
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={handleProgressChange}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-player-text mt-1">
            <span>{currentTime}</span>
            <span>{totalTime}</span>
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
              aria-label="Toggle shuffle"
              title="Toggle shuffle"
            >
              <Shuffle size={18} />
            </button>
            
            <button 
              onClick={onPrevious} 
              className="control-button"
              aria-label="Previous track"
              title="Previous track"
            >
              <SkipBack size={20} />
            </button>
          </>
        )}

        <button 
          onClick={onPlayPause} 
          className={cn(
            "play-button",
            minimal ? "w-8 h-8" : "w-12 h-12",
            isPlaying ? "bg-player-primary" : "bg-player-primary" 
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
          title={isPlaying ? "Pause" : "Play"}
        >
          {playerState.currentTrack?.audioUrl ? (
            isPlaying ? <Pause size={minimal ? 16 : 20} /> : <Play size={minimal ? 16 : 20} className="ml-0.5" />
          ) : (
            <Loader2 size={minimal ? 16 : 20} className="audio-loading" />
          )}
        </button>

        {!minimal && (
          <>
            <button 
              onClick={onNext} 
              className="control-button"
              aria-label="Next track"
              title="Next track"
            >
              <SkipForward size={20} />
            </button>
            
            <button 
              onClick={onToggleRepeat}
              className={cn(
                "control-button",
                isRepeat ? "text-player-primary" : "text-player-text"
              )}
              aria-label="Toggle repeat"
              title="Toggle repeat"
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
              onChange={handleVolumeChange}
              className="w-16 md:w-24"
              aria-label="Volume"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioControls;
