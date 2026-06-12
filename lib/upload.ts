import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
