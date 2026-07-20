import { NextResponse } from "next/server";
import { requireRole, assertSameOrigin } from "@/lib/admin/api";
import { STORAGE_BUCKET, STORAGE_FOLDERS, isValidStorageFolder } from "@/lib/media";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";

type MediaItem = {
  path: string;
  name: string;
  folder: string;
  url: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string | null;
};

// Storage .list() only returns one folder level at a time, so this fans out
// across the 6 known folders (folders here are just path prefixes, not real
// Storage objects) and merges the results into one list for the media
// library grid.
export async function GET() {
  const auth = await requireRole(["owner", "admin", "editor"]);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const results = await Promise.all(
    STORAGE_FOLDERS.map((folder) =>
      supabase.storage.from(STORAGE_BUCKET).list(folder, { sortBy: { column: "created_at", order: "desc" } })
    )
  );

  const items: MediaItem[] = [];
  let bucketError: string | null = null;
  STORAGE_FOLDERS.forEach((folder, i) => {
    const { data, error } = results[i];
    if (error) {
      bucketError = error.message;
      return;
    }
    if (!data) return;
    for (const obj of data) {
      if (!obj.id) continue; // skip non-file entries
      const path = `${folder}/${obj.name}`;
      const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      items.push({
        path,
        name: obj.name,
        folder,
        url: pub.publicUrl,
        mimeType: (obj.metadata?.mimetype as string | undefined) ?? null,
        size: (obj.metadata?.size as number | undefined) ?? null,
        createdAt: obj.created_at ?? null,
      });
    }
  });

  // If every folder failed (e.g. the bucket doesn't exist yet), return a
  // clean empty library instead of a 500 — the media page should still
  // render so an admin can see what's needed rather than a broken screen.
  if (bucketError && items.length === 0) {
    console.error("[media] List failed for all folders:", bucketError);
    return NextResponse.json([]);
  }

  items.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return NextResponse.json(items);
}

export async function DELETE(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireRole(["owner", "admin", "editor"]);
  if (!auth.ok) return auth.response;
  const { supabase, session } = auth;

  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path." }, { status: 400 });
  }

  // Only allow deleting within a known folder — never an arbitrary path.
  const folder = path.split("/")[0];
  if (!isValidStorageFolder(folder)) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) {
    console.error("[media] Delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete file." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "media_delete",
    entityType: "media",
    entityId: path,
    metadata: { path },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ ok: true });
}
