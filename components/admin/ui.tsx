"use client";

import { useState, type ReactNode } from "react";

const inputCls =
  "w-full rounded-xl border border-admin-border bg-admin-surface px-4 py-2.5 text-admin-body text-admin-text placeholder:text-admin-text-3 outline-none transition-colors duration-200 ease-admin focus:border-admin-accent/50 focus:bg-admin-surface-2 focus:ring-1 focus:ring-admin-accent/20";

export type SaveState = "idle" | "saving" | "saved" | "error";

export function Panel({
  title,
  description,
  headerAction,
  children,
}: {
  title: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-admin-border glass p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-admin-subhead font-semibold text-admin-text">{title}</h2>
          {description && <p className="mt-1 text-admin-body text-admin-text-2">{description}</p>}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>
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
      <span className="text-admin-label font-medium text-admin-text-2">{label}</span>
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

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M3 3l18 18M10.6 5.2A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.2M6.5 6.6C3.8 8.3 2 12 2 12s3.6 7 10 7c1.4 0 2.6-.3 3.7-.8M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Password field with a show/hide toggle inside the input. Hidden
 * (type="password") by default; the toggle only flips how the value is
 * displayed — it never changes, stores, or logs the value itself.
 */
export function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  name,
  id,
  required,
  autoComplete = "new-password",
  disabled,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  const field = (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        name={name}
        id={id}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`${inputCls} pr-11 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-xl text-admin-text-3 transition-colors duration-200 ease-admin hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );

  if (!label) return field;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-admin-label font-medium text-admin-text-2">{label}</span>
      {field}
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
      <span className="text-admin-label font-medium text-admin-text-2">{label}</span>
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

/**
 * Accessible on/off switch. A single <button role="switch"> (not a <label>
 * wrapping an onClick <span>) so it gets real keyboard support — Tab to
 * focus, Space/Enter to toggle — and a visible focus ring, for free from
 * the platform instead of hand-rolled key handlers.
 */
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
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-xl border border-admin-border bg-admin-surface px-4 py-3 text-left transition-colors duration-200 ease-admin hover:border-admin-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg"
    >
      <span className="text-admin-body text-admin-text/85">{label}</span>
      <span
        aria-hidden="true"
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-admin",
          checked ? "bg-admin-accent/70" : "bg-white/[0.12]",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-admin",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

export function SaveButton({
  state,
  label = "Save changes",
  onClick,
}: {
  state: SaveState;
  label?: string;
  onClick?: () => void;
}) {
  const text = state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : label;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "saving"}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-neon to-neon-soft px-5 py-2 text-admin-label font-semibold text-ink shadow-[0_10px_40px_-10px_rgba(13,253,209,0.55)] transition-shadow duration-200 ease-admin hover:shadow-[0_14px_50px_-8px_rgba(13,253,209,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg disabled:cursor-not-allowed disabled:opacity-70 sm:px-6 sm:py-2.5 sm:text-admin-body"
    >
      {text}
    </button>
  );
}

export function UnsavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-admin-caption font-medium text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Unsaved changes
    </span>
  );
}

export function StatusMessage({ state, error }: { state: SaveState; error?: string | null }) {
  if (state === "error") {
    return (
      <p className="rounded-lg border border-admin-danger/30 bg-admin-danger/10 px-3 py-2 text-admin-label text-admin-danger">
        {error || "Something went wrong. Please try again."}
      </p>
    );
  }
  if (state === "saved") {
    return (
      <p className="rounded-lg border border-admin-accent/25 bg-admin-accent/10 px-3 py-2 text-admin-label text-admin-accent">
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
        "rounded-lg border px-3 py-1.5 text-admin-label font-medium transition-colors duration-200 ease-admin focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40",
        variant === "danger"
          ? "border-admin-danger/25 text-admin-danger hover:bg-admin-danger/10"
          : "border-admin-border text-admin-text-2 hover:bg-admin-surface-2 hover:text-admin-text",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
