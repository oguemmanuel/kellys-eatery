import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "dishes";
const MAX_WIDTH = 1200;
const TARGET_BYTES = 200 * 1024;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export class ImageError extends Error {}

// Shrinks a dish photo to WebP of about 200KB and stores it in Supabase
// Storage. Returns the public URL.
export async function uploadDishImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/"))
    throw new ImageError("Please choose a photo.");
  if (file.size > MAX_UPLOAD_BYTES)
    throw new ImageError("That photo is too large.");

  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer | null = null;
  for (const quality of [80, 70, 60, 50]) {
    output = await sharp(input)
      .rotate() // respect the phone's orientation
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    if (output.length <= TARGET_BYTES) break;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new ImageError("Photo uploads are not set up yet.");

  const storage = createClient(url, key, {
    auth: { persistSession: false },
  }).storage;
  const path = `${randomUUID()}.webp`;
  const upload = () =>
    storage.from(BUCKET).upload(path, output!, { contentType: "image/webp" });

  let { error } = await upload();
  if (error && /bucket not found/i.test(error.message)) {
    await storage.createBucket(BUCKET, { public: true });
    ({ error } = await upload());
  }
  if (error)
    throw new ImageError("The photo could not be saved. Please try again.");

  return storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
