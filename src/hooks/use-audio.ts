
import { useEffect, useRef, useState } from 'react';
import { Track } from '@/lib/types';

interface UseAudioReturn {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
  onEnded: () => void;
}

export function useAudio(
  track: Track | null,
  onEnded?: () => void
): UseAudioReturn {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    
    if (track?.audioUrl) {
      setIsLoading(true);
      audio.src = track.audioUrl;
      audio.load();
      
      const loadHandler = () => {
        setIsLoading(false);
        setDuration(audio.duration);
        if (isPlaying) audio.play();
      };
      
      const errorHandler = (error: ErrorEvent) => {
        console.error("Error loading audio:", error);
        setIsLoading(false);
        setIsPlaying(false);
      };
      
      audio.addEventListener('loadeddata', loadHandler);
      audio.addEventListener('error', errorHandler);
      
      return () => {
        audio.removeEventListener('loadeddata', loadHandler);
        audio.removeEventListener('error', errorHandler);
      };
    } else {
      // No track or no URL
      audio.pause();
      setIsPlaying(false);
      setProgress(0);
    }
  }, [track, isPlaying]);

  // Update volume
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
  }, [volume]);

  // Handle play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Audio playback error:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Track progress
  useEffect(() => {
    const audio = audioRef.current;
    
    const updateProgress = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (onEnded) onEnded();
    };
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  // Cleanup on unmount
  useEffect(() => {
    const audio = audioRef.current;
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Control functions
  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const toggle = () => setIsPlaying(!isPlaying);
  
  const seek = (position: number) => {
    const audio = audioRef.current;
    if (audio.duration) {
      audio.currentTime = position * audio.duration;
      setProgress(position);
    }
  };

  const handleSetVolume = (newVolume: number) => {
    setVolume(newVolume);
  };

  return {
    audioRef,
    isPlaying,
    progress,
    duration,
    volume,
    isLoading,
    play,
    pause,
    toggle,
    seek,
    setVolume: handleSetVolume,
    onEnded: onEnded || (() => {}),
  };
}
