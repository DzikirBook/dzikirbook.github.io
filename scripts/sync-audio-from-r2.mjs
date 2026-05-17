/**
 * Downloads audio/ objects from R2 into public/audio/ for same-origin playback.
 *
 * Usage:
 *   R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... node scripts/sync-audio-from-r2.mjs
 */

import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import {
  R2_ACCOUNT_ID,
  R2_BUCKET_NAME,
  R2_AUDIO_PREFIX,
  getR2Credentials,
} from "./r2-config.mjs";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".ogg", ".wav"];
const OUTPUT_ROOT = "public";

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

async function listAudioKeys() {
  const keys = [];
  let continuationToken;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: R2_AUDIO_PREFIX,
        ContinuationToken: continuationToken,
      })
    );

    for (const obj of response.Contents ?? []) {
      if (AUDIO_EXTENSIONS.some((ext) => obj.Key.toLowerCase().endsWith(ext))) {
        keys.push(obj.Key);
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

async function downloadKey(key) {
  const response = await client.send(
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );

  const outputPath = join(OUTPUT_ROOT, key);
  mkdirSync(dirname(outputPath), { recursive: true });

  const body = response.Body;
  if (!body) {
    throw new Error(`Empty body for ${key}`);
  }

  if (body instanceof Readable) {
    await pipeline(body, createWriteStream(outputPath));
    return;
  }

  const bytes = await body.transformToByteArray();
  writeFileSync(outputPath, bytes);
}

async function main() {
  console.log("Syncing audio from R2 bucket:", R2_BUCKET_NAME);
  const keys = await listAudioKeys();
  console.log(`Found ${keys.length} audio file(s).`);

  let downloaded = 0;
  for (const key of keys) {
    const outputPath = join(OUTPUT_ROOT, key);
    if (existsSync(outputPath)) {
      console.log("skip (exists):", key);
      continue;
    }
    console.log("download:", key);
    await downloadKey(key);
    downloaded += 1;
  }

  const manifest = { files: keys };
  const manifestPath = join(OUTPUT_ROOT, "manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${manifestPath} (${downloaded} new file(s)).`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
