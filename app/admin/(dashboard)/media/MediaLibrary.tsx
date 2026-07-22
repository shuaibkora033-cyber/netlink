"use client";

import { useEffect, useRef, useState } from "react";
import { STORAGE_FOLDERS, type StorageFolder } from "@/lib/media";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { ErrorState, EmptyState, SkeletonBlock, useRetryGuard } from "@/components/admin/ui";

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

/** Mirrors MediaCard's shape (thumbnail + two text lines + a button row) so
 * the loading state doesn't jump when real cards replace it. */
function MediaCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-admin-border bg-admin-surface">
      <div className="aspect-video w-full bg-admin-surface-2" aria-hidden="true" />
      <div className="flex flex-col gap-2 p-3">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
        <div className="mt-2 flex items-center gap-2">
          <SkeletonBlock className="h-7 flex-1" />
          <SkeletonBlock className="h-7 w-16" />
        </div>
      </div>
    </div>
  );
}

function MediaGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-admin-border bg-admin-surface">
      <div className="aspect-video w-full overflow-hidden bg-admin-bg">
        {isVideoItem(item) ? (
          <video src={item.url} controls className="h-full w-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic Storage URLs, arbitrary uploaded content
          <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="truncate text-admin-label font-medium text-admin-text" title={item.name}>{item.name}</p>
        <p className="text-admin-caption text-admin-text-3">
          {item.folder} · {item.mimeType ?? "unknown"} · {formatBytes(item.size)} · {formatDate(item.createdAt)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={copyUrl}
            className="flex-1 rounded-lg border border-admin-border px-2.5 py-1.5 text-admin-caption text-admin-text-2 transition-colors duration-200 ease-admin hover:border-admin-accent/30 hover:text-admin-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
          >
            {copied ? "Copied" : "Copy URL"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-admin-border px-2.5 py-1.5 text-admin-caption text-admin-text-2 transition-colors duration-200 ease-admin hover:border-admin-danger/30 hover:text-admin-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 disabled:opacity-50"
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

  // Fetches the media grid. Deliberately NOT shared between the mount/retry
  // path below and handleLibraryUpload's post-upload refresh — two
  // independent fetch-and-setState call sites, so neither reads as an effect
  // indirectly driving setState through a function also called from an
  // event handler. `signal` is only threaded through by loadMedia, which
  // owns cancellation for the mount/retry path.
  async function fetchMedia(signal?: AbortSignal): Promise<MediaItem[] | null> {
    const res = await fetch("/api/admin/media", { signal });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load media.");
    return data;
  }

  // Tracks the most recent load so a slower, superseded response can never
  // overwrite state set by a newer one, and aborts the in-flight request on
  // unmount or when a newer call starts.
  const requestRef = useRef<AbortController | null>(null);

  // The mount effect below calls fetchMedia directly (inline), not through a
  // hoisted function that itself setStates — eslint-plugin-react-hooks's
  // `set-state-in-effect` rule flags a hoisted function's synchronous
  // setState prefix as unsafe when the effect is its only caller. handleRetry
  // below duplicates a few lines rather than sharing this exact shape,
  // precisely to keep the effect's call site inline.
  useEffect(() => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    (async () => {
      try {
        const data = await fetchMedia(controller.signal);
        if (requestRef.current !== controller) return;
        setItems(data ?? []);
        setLoadState("ready");
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (requestRef.current !== controller) return;
        setLoadState("error");
      }
    })();
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  const { retrying, guardedRetry } = useRetryGuard();

  // Distinct from the plain mount call above — a retry keeps loadState at
  // "error" (so ErrorState stays mounted with its own "Retrying…" state)
  // instead of flipping to the generic loading skeleton.
  function handleRetry() {
    guardedRetry(async () => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      try {
        const data = await fetchMedia(controller.signal);
        if (requestRef.current !== controller) return;
        setItems(data ?? []);
        setLoadState("ready");
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (requestRef.current !== controller) return;
        setLoadState("error");
      }
    });
  }

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
        <h1 className="text-admin-h1 font-semibold text-admin-text">Media</h1>
        <p className="mt-1 text-admin-body text-admin-text-2">
          Upload images and videos to Supabase Storage, then copy their URL into any content
          field across the site.
        </p>
      </div>

      <div className="rounded-2xl border border-admin-border glass p-5 sm:p-7">
        <h2 className="text-admin-subhead font-semibold text-admin-text">Upload new file</h2>
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-admin-label font-medium text-admin-text-2">Folder</span>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value as StorageFolder)}
              className="w-full cursor-pointer rounded-xl border border-admin-border bg-admin-surface px-4 py-2.5 text-admin-body text-admin-text outline-none transition-colors duration-200 ease-admin focus:border-admin-accent/50 sm:w-auto"
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
            className={`rounded-full border px-3.5 py-1.5 text-admin-label font-medium capitalize transition-colors duration-200 ease-admin focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 ${
              typeFilter === f
                ? "border-admin-accent/40 bg-admin-accent/10 text-admin-accent"
                : "border-admin-border bg-admin-surface text-admin-text-2 hover:text-admin-text"
            }`}
          >
            {f === "all" ? "All" : `${f}s`}
          </button>
        ))}
      </div>

      {loadState === "loading" && <MediaGridSkeleton />}
      {loadState === "error" && (
        <ErrorState message="Could not load media." onRetry={handleRetry} retrying={retrying} />
      )}
      {loadState === "ready" && filtered.length === 0 && items.length === 0 && (
        <EmptyState message="No media uploaded yet. Upload a file above to get started." />
      )}
      {loadState === "ready" && filtered.length === 0 && items.length > 0 && (
        <EmptyState
          message={`No ${typeFilter}s uploaded yet.`}
          actionLabel="Show all"
          onAction={() => setTypeFilter("all")}
        />
      )}

      {loadState === "ready" && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
