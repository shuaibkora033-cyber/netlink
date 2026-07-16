/**
 * Shared constants for the Supabase Storage-backed media system
 * (app/api/admin/media/*, components/admin/MediaUploader.tsx,
 * app/admin/(dashboard)/media/*). Bucket: site-media (public — see
 * supabase/schema.sql). Imported by both the admin upload route (server,
 * validates against these) and admin UI components (client, sets `accept`/
 * shows limits) — one source of truth for what's allowed. Deliberately has
 * no server-only imports (unlike lib/media/buildStoragePath.ts) so it's
 * safe to import from client components too.
 */

export const STORAGE_BUCKET = "site-media";

export const STORAGE_FOLDERS = ["backgrounds", "proof", "feedback", "ugc", "videos", "uploads"] as const;
export type StorageFolder = (typeof STORAGE_FOLDERS)[number];
export const DEFAULT_STORAGE_FOLDER: StorageFolder = "uploads";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] as const;
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;
export const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

export function isImageType(mimeType: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}
export function isVideoType(mimeType: string): boolean {
  return (ALLOWED_VIDEO_TYPES as readonly string[]).includes(mimeType);
}

export function isValidStorageFolder(folder: string): folder is StorageFolder {
  return (STORAGE_FOLDERS as readonly string[]).includes(folder);
}
