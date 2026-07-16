import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminSupabase } from "@/lib/admin/api";
import {
  STORAGE_BUCKET,
  DEFAULT_STORAGE_FOLDER,
  isValidStorageFolder,
  isImageType,
  isVideoType,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/media";

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

// Unique, safe storage path: "<folder>/<slugified-name>-<suffix>.<ext>". The
// original file name is never trusted as-is (no path traversal, no odd
// unicode/whitespace) while staying human-readable in the media library.
function buildStoragePath(folder: string, originalName: string, mimeType: string): string {
  const base = originalName
    .replace(/\.[^./]+$/, "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const slug = base || "file";
  const suffix = randomUUID().slice(0, 8);
  const ext = EXTENSION_BY_TYPE[mimeType] ?? "bin";
  return `${folder}/${slug}-${suffix}.${ext}`;
}

export async function POST(request: Request) {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const rawFolder = form.get("folder");
  const folder = typeof rawFolder === "string" && isValidStorageFolder(rawFolder) ? rawFolder : DEFAULT_STORAGE_FOLDER;

  const mimeType = file.type;
  const isImage = isImageType(mimeType);
  const isVideo = isVideoType(mimeType);
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File is too large. Max size is ${Math.round(maxBytes / (1024 * 1024))}MB.` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Defense-in-depth: browsers don't execute scripts embedded in SVGs
  // rendered via <img>, but reject anything with a <script tag anyway so a
  // direct URL navigation can't trigger it either.
  if (mimeType === "image/svg+xml" && /<script/i.test(buffer.toString("utf8"))) {
    return NextResponse.json({ error: "SVG files with embedded scripts are not allowed." }, { status: 400 });
  }

  const path = buildStoragePath(folder, file.name, mimeType);

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return NextResponse.json({
    url: publicUrlData.publicUrl,
    path,
    fileName: file.name,
    mimeType,
    size: file.size,
  });
}
