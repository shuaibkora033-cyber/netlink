"use client";

import { useRef, useState } from "react";
import {
  type StorageFolder,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  isImageType,
  isVideoType,
} from "@/lib/media";

type Kind = "image" | "video" | "image,video";

type UploadState = "idle" | "uploading" | "success" | "error";

function looksLikeVideo(url: string): boolean {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

function acceptAttr(kind: Kind): string {
  if (kind === "image") return "image/jpeg,image/png,image/webp,image/svg+xml";
  if (kind === "video") return "video/mp4,video/webm";
  return "image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm";
}

/** Parses a fetch Response as JSON without ever throwing — a 413 from a
 * reverse proxy (nginx, etc.) typically returns an HTML error page, not
 * JSON, and letting `res.json()` throw would surface a raw
 * "Unexpected token '<'..." parse error to the admin instead of a real
 * message. */
async function safeJson(res: Response): Promise<{ error?: string; url?: string } | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Reusable media field: manual URL input (kept as a fallback per spec) plus
 * a drag-and-drop/click uploader that uploads to Supabase Storage via
 * POST /api/admin/media/upload and fills the URL automatically on success.
 * Controlled — `value` is just a plain URL string, so this drops into any
 * CMS field the same way a TextField would.
 */
export function MediaUploader({
  folder,
  accept,
  value,
  onChange,
  label,
}: {
  folder: StorageFolder;
  accept: Kind;
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setState("uploading");
    setError(null);

    // Client-side size/type validation before we ever hit the network — the
    // server validates this too (never trust the client), but catching it
    // here avoids a round trip and gives an immediate, specific message.
    const isVideo = isVideoType(file.type);
    const isImage = isImageType(file.type);
    if (!isVideo && !isImage) {
      setError("Unsupported file type.");
      setState("error");
      return;
    }
    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      setError("Video is too large. Please upload a video under 50MB.");
      setState("error");
      return;
    }
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      setError("Image is too large. Please upload an image under 5MB.");
      setState("error");
      return;
    }

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });

      if (res.status === 413) {
        throw new Error("Upload failed because the server upload limit is too low or the file is too large.");
      }

      const json = await safeJson(res);
      if (!res.ok || !json?.url) {
        throw new Error(json?.error || "Upload failed. Please try again.");
      }

      onChange(json.url);
      setState("success");
      setTimeout(() => setState((s) => (s === "success" ? "idle" : s)), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
      setState("error");
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) uploadFile(file);
  }

  function copyUrl() {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const isVideo = accept === "video" || (accept === "image,video" && looksLikeVideo(value));

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-xs font-medium text-muted">{label}</span>}

      {value && (
        <div className="relative overflow-hidden rounded-xl border border-line bg-charcoal">
          {isVideo ? (
            <video src={value} controls className="h-32 w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded/pasted URLs, not a static local asset
            <img src={value} alt="" className="h-32 w-full object-cover" />
          )}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-5 text-center transition-colors ${
          dragOver ? "border-neon/50 bg-neon/[0.04]" : "border-line bg-white/[0.02]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr(accept)}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-xs text-muted">Drag and drop, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={state === "uploading"}
          className="rounded-full border border-line bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-fg transition-colors hover:border-neon/30 hover:text-neon disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "uploading" ? "Uploading…" : "Choose file to upload"}
        </button>
      </div>

      {state === "error" && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
      )}
      {state === "success" && <p className="text-xs text-neon">Uploaded.</p>}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste a URL"
          className="w-full rounded-xl border border-line bg-white/[0.03] px-3 py-2 text-xs text-fg placeholder:text-muted/60 outline-none transition-all duration-200 focus:border-neon/50 focus:ring-1 focus:ring-neon/20"
        />
        {value && (
          <>
            <button
              type="button"
              onClick={copyUrl}
              className="shrink-0 rounded-lg border border-line px-2.5 py-2 text-xs text-muted transition-colors hover:border-neon/30 hover:text-neon"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="shrink-0 rounded-lg border border-line px-2.5 py-2 text-xs text-muted transition-colors hover:border-red-500/30 hover:text-red-400"
            >
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
}
