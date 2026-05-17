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
import {
  R2_ACCOUNT_ID,
  R2_BUCKET_NAME,
  R2_AUDIO_PREFIX,
  R2_PUBLIC_URL,
  getR2Credentials,
} from "./r2-config.mjs";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".ogg", ".wav"];
const { accessKeyId, secretAccessKey } = getR2Credentials();

if (!accessKeyId || !secretAccessKey) {
  console.error("Missing R2_ACCESS_KEY_ID or R2_SECRET_ACCESS_KEY.");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function listAllObjects(prefix) {
  const keys = [];
  let continuationToken;

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
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
  console.log("Listing R2 bucket:", R2_BUCKET_NAME, "prefix:", R2_AUDIO_PREFIX);
  const files = await listAllObjects(R2_AUDIO_PREFIX);

  console.log(`Found ${files.length} audio files:`);
  files.forEach((f) => console.log(" -", f));

  const manifest = { files };
  const manifestJson = JSON.stringify(manifest, null, 2);

  // Simpan ke public/ agar ikut deploy GitHub Pages
  writeFileSync("public/manifest.json", manifestJson);
  console.log("\nSaved public/manifest.json.");

  // Upload ke R2 (root bucket, bukan dalam folder)
  console.log("Uploading manifest.json to R2...");
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: "manifest.json",
      Body: manifestJson,
      ContentType: "application/json",
    })
  );

  console.log("Done! manifest.json uploaded to R2.");
  console.log("Public URL:", `${R2_PUBLIC_URL}/manifest.json`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
