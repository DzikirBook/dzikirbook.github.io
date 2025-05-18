
import { useEffect, useRef, useState } from 'react';
import { Track } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface UseAudioReturn {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    
    if (track?.audioUrl) {
      // Reset error state when trying a new track
      setHasError(false);
      setErrorMessage(null);
      setIsLoading(true);

      // Make sure we're paused before loading a new source
      audio.pause();
      
      // Try to load the audio file
      audio.src = track.audioUrl;
      audio.preload = "auto"; // Preload audio data
      audio.crossOrigin = "anonymous"; // Important for CORS
      audio.load();
      
      const loadHandler = () => {
        setIsLoading(false);
        setDuration(audio.duration);
        if (isPlaying) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Audio playback error:", error);
              setIsPlaying(false);
              setHasError(true);
              setErrorMessage("Browser requires user interaction to play audio");
              
              toast({
                title: "Playback Error",
                description: "Browser security requires you to click play first",
                variant: "destructive",
              });
            });
          }
        }
      };
      
      const errorHandler = (error: ErrorEvent) => {
        console.error("Error loading audio:", error);
        setIsLoading(false);
        setIsPlaying(false);
        setHasError(true);
        setErrorMessage("Could not load audio file. Please try again later.");
        
        toast({
          title: "Audio Error",
          description: "Could not load audio file. Please try again later.",
          variant: "destructive",
        });
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
  }, [track, isPlaying, toast]);

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
          setHasError(true);
          setErrorMessage("Browser requires user interaction to play audio");
          
          toast({
            title: "Playback Error",
            description: "Browser security requires you to click play first",
            variant: "destructive",
          });
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, toast]);

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
  const play = () => {
    // Reset error state when attempting to play
    setHasError(false);
    setErrorMessage(null);
    setIsPlaying(true);
  };
  
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
    hasError,
    errorMessage,
    play,
    pause,
    toggle,
    seek,
    setVolume: handleSetVolume,
    onEnded: onEnded || (() => {}),
  };
}
