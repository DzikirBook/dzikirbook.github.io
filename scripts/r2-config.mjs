export const R2_ACCOUNT_ID = "01db0a5c4608f22ceb8f11fa55504ba3";
export const R2_BUCKET_NAME = "dzikir-audio";
export const R2_AUDIO_PREFIX = "audio/";
export const R2_PUBLIC_URL =
  process.env.VITE_R2_PUBLIC_URL ||
  "https://pub-adfc2ecb0e5449b1a28b530453c3afc7.r2.dev";

export function getR2Credentials() {
  return {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  };
}
