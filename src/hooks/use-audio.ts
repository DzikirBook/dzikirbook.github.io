import { useCallback, useEffect, useRef, useState } from "react";
import { Track } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { mapMediaElementError, mapPlaybackError } from "@/lib/media-error";

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
  retryLoading: () => void;
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
  const [loadAttempts, setLoadAttempts] = useState(0);
  const { toast } = useToast();

  const isPlayingRef = useRef(false);
  const wantsPlayRef = useRef(false);
  const hasLoadErrorRef = useRef(false);

  const syncDurationFromAudio = useCallback((audio: HTMLAudioElement) => {
    const { duration: audioDuration } = audio;
    if (Number.isFinite(audioDuration) && audioDuration > 0) {
      setDuration(audioDuration);
    }
  }, []);

  const applyLoadError = useCallback(
    (audio: HTMLAudioElement, showToast: boolean) => {
      const info = mapMediaElementError(audio.error);
      hasLoadErrorRef.current = true;
      setIsLoading(false);
      setIsPlaying(false);
      setHasError(true);
      setErrorMessage(info.message);
      setDuration(0);
      setProgress(0);

      if (showToast) {
        toast({
          title: "Audio Error",
          description: info.toastDescription,
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const attemptPlay = useCallback(
    (audio: HTMLAudioElement, showToast: boolean) => {
      if (hasLoadErrorRef.current || !audio.src) {
        return;
      }

      const playPromise = audio.play();
      if (playPromise === undefined) {
        return;
      }

      playPromise.catch((error) => {
        console.error("Audio playback error:", error);
        const info = mapPlaybackError(error);
        setIsPlaying(false);
        setHasError(true);
        setErrorMessage(info.message);

        if (showToast) {
          toast({
            title: "Playback Error",
            description: info.toastDescription,
            variant: "destructive",
          });
        }
      });
    },
    [toast]
  );

  useEffect(() => {
    const audio = audioRef.current;
    const nextUrl = track?.audioUrl ?? null;

    if (!nextUrl) {
      audio.pause();
      audio.removeAttribute("src");
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
      setIsLoading(false);
      hasLoadErrorRef.current = false;
      return;
    }

    hasLoadErrorRef.current = false;
    setHasError(false);
    setErrorMessage(null);
    setIsLoading(true);
    setDuration(0);
    setProgress(0);
    audio.pause();
    audio.preload = "auto";
    audio.src = nextUrl;
    audio.load();

    const onLoadedMetadata = () => {
      syncDurationFromAudio(audio);
    };

    const onDurationChange = () => {
      syncDurationFromAudio(audio);
    };

    const onCanPlay = () => {
      setIsLoading(false);
      syncDurationFromAudio(audio);
      if (wantsPlayRef.current && isPlayingRef.current) {
        attemptPlay(audio, true);
      }
    };

    const onLoadedData = () => {
      setIsLoading(false);
      syncDurationFromAudio(audio);
    };

    const onError = () => {
      console.error("Error loading audio:", audio.error);
      applyLoadError(audio, wantsPlayRef.current);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("loadeddata", onLoadedData);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("loadeddata", onLoadedData);
      audio.removeEventListener("error", onError);
    };
  }, [track?.audioUrl, loadAttempts, applyLoadError, attemptPlay, syncDurationFromAudio]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    isPlayingRef.current = isPlaying;

    if (!isPlaying) {
      audio.pause();
      return;
    }

    if (hasLoadErrorRef.current) {
      setIsPlaying(false);
      return;
    }

    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      attemptPlay(audio, true);
    }
  }, [isPlaying, attemptPlay]);

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      syncDurationFromAudio(audio);
      const { currentTime, duration: audioDuration } = audio;
      if (Number.isFinite(audioDuration) && audioDuration > 0) {
        setProgress(currentTime / audioDuration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      onEnded?.();
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onEnded, syncDurationFromAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause();
      audio.removeAttribute("src");
    };
  }, []);

  const play = () => {
    wantsPlayRef.current = true;
    setHasError(false);
    setErrorMessage(null);
    setIsPlaying(true);
  };

  const pause = () => {
    wantsPlayRef.current = false;
    setIsPlaying(false);
  };

  const toggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seek = (position: number) => {
    const audio = audioRef.current;
    if (audio.duration) {
      audio.currentTime = position * audio.duration;
      setProgress(position);
    }
  };

  const retryLoading = () => {
    wantsPlayRef.current = true;
    hasLoadErrorRef.current = false;
    setHasError(false);
    setErrorMessage(null);
    setLoadAttempts((prev) => prev + 1);
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
    setVolume,
    onEnded: onEnded ?? (() => {}),
    retryLoading,
  };
}
