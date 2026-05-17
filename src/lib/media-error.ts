export type AudioErrorKind = "autoplay" | "network" | "decode" | "unsupported" | "aborted" | "unknown";

export interface AudioErrorInfo {
  kind: AudioErrorKind;
  message: string;
  toastDescription: string;
}

export function mapMediaElementError(error: MediaError | null): AudioErrorInfo {
  if (!error) {
    return {
      kind: "unknown",
      message: "Could not load audio file. Please try again.",
      toastDescription: "Audio failed to load.",
    };
  }

  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return {
        kind: "aborted",
        message: "Audio loading was cancelled.",
        toastDescription: "Audio loading was cancelled.",
      };
    case MediaError.MEDIA_ERR_NETWORK:
      return {
        kind: "network",
        message: "Could not reach the audio file. Check your connection and try again.",
        toastDescription: "Network error while loading audio.",
      };
    case MediaError.MEDIA_ERR_DECODE:
      return {
        kind: "decode",
        message: "This audio file could not be decoded by your browser.",
        toastDescription: "Audio file could not be decoded.",
      };
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return {
        kind: "unsupported",
        message: "Audio file not found or not supported. It may still be deploying.",
        toastDescription: "Audio source is missing or unsupported.",
      };
    default:
      return {
        kind: "unknown",
        message: "Could not load audio file. Please try again.",
        toastDescription: "Audio failed to load.",
      };
  }
}

export function mapPlaybackError(error: unknown): AudioErrorInfo {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return {
      kind: "autoplay",
      message: "Tap play to start audio (browser requires a click).",
      toastDescription: "Click play to start audio.",
    };
  }

  if (error instanceof DOMException && error.name === "NotSupportedError") {
    return {
      kind: "unsupported",
      message: "No playable audio source is available yet.",
      toastDescription: "Audio is not ready to play.",
    };
  }

  return {
    kind: "unknown",
    message: "Unable to start playback. Please try again.",
    toastDescription: "Playback could not start.",
  };
}
