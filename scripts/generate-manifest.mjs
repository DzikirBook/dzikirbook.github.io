/**
 * generate-manifest.mjs
 * 
 * Jalankan sekali untuk generate manifest.json dari R2 bucket,
 * lalu upload hasilnya ke R2.
 * 
 * Usage:
 *   node generate-manifest.mjs
 * 
 * Requirements:
 *   npm install @aws-sdk/client-s3
 */

import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFileSync } from "fs";

// === KONFIGURASI R2 ===
const ACCOUNT_ID = "01db0a5c4608f22ceb8f11fa55504ba3";
const BUCKET_NAME = "dzikir-audio";          // nama bucket di R2
const AUDIO_PREFIX = "audio/";
const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".ogg", ".wav"];

// Isi ACCESS_KEY dan SECRET_KEY dari R2 → Settings → API tokens
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "GANTI_INI";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "GANTI_INI";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

async function listAllObjects(prefix) {
  const keys = [];
  let continuationToken;

  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const response = await client.send(command);
    const contents = response.Contents ?? [];

    for (const obj of contents) {
      if (AUDIO_EXTENSIONS.some((ext) => obj.Key.toLowerCase().endsWith(ext))) {
        keys.push(obj.Key);
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

async function main() {
  console.log("Listing R2 bucket:", BUCKET_NAME, "prefix:", AUDIO_PREFIX);
  const files = await listAllObjects(AUDIO_PREFIX);

  console.log(`Found ${files.length} audio files:`);
  files.forEach((f) => console.log(" -", f));

  const manifest = { files };
  const manifestJson = JSON.stringify(manifest, null, 2);

  // Simpan lokal
  writeFileSync("manifest.json", manifestJson);
  console.log("\nSaved manifest.json locally.");

  // Upload ke R2 (root bucket, bukan dalam folder)
  console.log("Uploading manifest.json to R2...");
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: "manifest.json",
      Body: manifestJson,
      ContentType: "application/json",
    })
  );

  console.log("Done! manifest.json uploaded to R2.");
  console.log("Public URL: https://pub-adfc2ecb0e5449b1a28b530453c3afc7.r2.dev/manifest.json");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
