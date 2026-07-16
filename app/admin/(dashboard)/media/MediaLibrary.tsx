"use client";

import { useEffect, useState } from "react";
import { STORAGE_FOLDERS, type StorageFolder } from "@/lib/media";
import { MediaUploader } from "@/components/admin/MediaUploader";

type MediaItem = {
  path: string;
  name: string;
  folder: string;
  url: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string | null;
};

type LoadState = "loading" | "ready" | "error";
type TypeFilter = "all" | "image" | "video";

function isVideoItem(item: MediaItem): boolean {
  return item.mimeType?.startsWith("video/") ?? /\.(mp4|webm)$/i.test(item.name);
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function MediaCard({ item, onDeleted }: { item: MediaItem; onDeleted: (path: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${item.name}? This can't be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/media?path=${encodeURIComponent(item.path)}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted(item.path);
    } else {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.02]">
      <div className="aspect-video w-full overflow-hidden bg-charcoal">
        {isVideoItem(item) ? (
          <video src={item.url} controls className="h-full w-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic Storage URLs, arbitrary uploaded content
          <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="truncate text-xs font-medium text-fg" title={item.name}>{item.name}</p>
        <p className="text-[0.65rem] text-muted">
          {item.folder} · {item.mimeType ?? "unknown"} · {formatBytes(item.size)} · {formatDate(item.createdAt)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={copyUrl}
            className="flex-1 rounded-lg border border-line px-2.5 py-1.5 text-[0.7rem] text-muted transition-colors hover:border-neon/30 hover:text-neon"
          >
            {copied ? "Copied" : "Copy URL"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-line px-2.5 py-1.5 text-[0.7rem] text-muted transition-colors hover:border-red-500/30 hover:text-red-400 disabled:opacity-50"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [uploadFolder, setUploadFolder] = useState<StorageFolder>("uploads");
  const [uploadUrl, setUploadUrl] = useState("");

  // Fetches the media grid. Deliberately NOT shared between the mount effect
  // below and handleLibraryUpload's post-upload refresh — two independent
  // fetch-and-setState functions, one per call site, so neither reads as an
  // effect indirectly driving setState through a function also called from
  // an event handler.
  async function fetchMedia(): Promise<MediaItem[] | null> {
    const res = await fetch("/api/admin/media");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load media.");
    return data;
  }

  useEffect(() => {
    fetchMedia()
      .then((data) => {
        setItems(data ?? []);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, []);

  // The uploader here is just a quick way to add files to the library — once
  // a file uploads, refresh the grid below and reset the field. This is a
  // response to the upload finishing (an event), not a sync-on-render
  // concern, so it lives in the change handler rather than an effect.
  async function handleLibraryUpload(url: string) {
    setUploadUrl(url);
    if (!url) return;
    try {
      const data = await fetchMedia();
      setItems(data ?? []);
    } catch {
      // Grid just keeps its previous contents; the uploader itself already
      // surfaces the real upload error state to the admin.
    } finally {
      setUploadUrl("");
    }
  }

  const filtered = items.filter((item) => {
    if (typeFilter === "all") return true;
    return typeFilter === "video" ? isVideoItem(item) : !isVideoItem(item);
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Media</h1>
        <p className="mt-1 text-sm text-muted">
          Upload images and videos to Supabase Storage, then copy their URL into any content
          field across the site.
        </p>
      </div>

      <div className="rounded-2xl border border-line glass p-5 sm:p-7">
        <h2 className="text-sm font-semibold text-fg">Upload new file</h2>
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Folder</span>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value as StorageFolder)}
              className="w-full cursor-pointer rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-fg outline-none transition-all duration-200 focus:border-neon/50 sm:w-auto"
            >
              {STORAGE_FOLDERS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
          <MediaUploader folder={uploadFolder} accept="image,video" value={uploadUrl} onChange={handleLibraryUpload} />
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "image", "video"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setTypeFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
              typeFilter === f
                ? "border-neon/40 bg-neon/10 text-neon"
                : "border-line bg-white/[0.02] text-muted hover:text-fg"
            }`}
          >
            {f === "all" ? "All" : `${f}s`}
          </button>
        ))}
      </div>

      {loadState === "loading" && <p className="text-sm text-muted">Loading media…</p>}
      {loadState === "error" && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          Could not load media.
        </p>
      )}
      {loadState === "ready" && filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
          No media uploaded yet.
        </p>
      )}

      {loadState === "ready" && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <MediaCard
              key={item.path}
              item={item}
              onDeleted={(path) => setItems((prev) => prev.filter((i) => i.path !== path))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
