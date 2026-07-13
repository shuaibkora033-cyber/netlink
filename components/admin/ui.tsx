"use client";

import type { ReactNode } from "react";

const inputCls =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-fg placeholder:text-muted/60 outline-none transition-all duration-200 focus:border-neon/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-neon/20";

export type SaveState = "idle" | "saving" | "saved" | "error";

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line glass p-5 sm:p-7">
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={inputCls}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${inputCls} resize-none`}
      />
    </label>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-white/[0.02] px-4 py-3">
      <span className="text-sm text-fg/85">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-neon/70" : "bg-white/[0.12]",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          ].join(" ")}
        />
      </span>
    </label>
  );
}

export function SaveButton({ state }: { state: SaveState }) {
  const label =
    state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : "Save changes";

  return (
    <button
      type="submit"
      disabled={state === "saving"}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-neon to-neon-soft px-6 py-2.5 text-sm font-semibold text-ink shadow-[0_10px_40px_-10px_rgba(13,253,209,0.55)] transition-shadow hover:shadow-[0_14px_50px_-8px_rgba(13,253,209,0.75)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {label}
    </button>
  );
}

export function StatusMessage({ state, error }: { state: SaveState; error?: string | null }) {
  if (state === "error") {
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
        {error || "Something went wrong. Please try again."}
      </p>
    );
  }
  if (state === "saved") {
    return (
      <p className="rounded-lg border border-neon/25 bg-neon/10 px-3 py-2 text-xs text-neon">
        Changes saved.
      </p>
    );
  }
  return null;
}

export function IconButton({
  onClick,
  label,
  variant = "default",
}: {
  onClick: () => void;
  label: string;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        variant === "danger"
          ? "border-red-500/25 text-red-400 hover:bg-red-500/10"
          : "border-line text-muted hover:bg-white/[0.05] hover:text-fg",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
