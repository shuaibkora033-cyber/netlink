"use client";

import { useId, useState, type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

const inputCls =
  "w-full rounded-xl border border-admin-border bg-admin-surface px-4 py-2.5 text-admin-body text-admin-text placeholder:text-admin-text-3 outline-none transition-colors duration-200 ease-admin focus:border-admin-accent/50 focus:bg-admin-surface-2 focus:ring-1 focus:ring-admin-accent/20";
const inputErrorCls = "border-admin-danger/50 focus:border-admin-danger/60 focus:ring-admin-danger/20";

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Inline field error — rendered under a field and wired via aria-describedby
 * from the input itself, so screen readers announce it as part of the field,
 * not just a floating paragraph. */
function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="text-admin-caption text-admin-danger">
      {message}
    </p>
  );
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-admin-danger">
      {" "}*
    </span>
  );
}

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
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  error?: string | null;
}) {
  const errorId = useId();
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-admin-label font-medium text-admin-text-2">
        {label}
        {required && <RequiredMark />}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${inputCls} ${error ? inputErrorCls : ""}`}
      />
      {error && <FieldError id={errorId} message={error} />}
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
  error,
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
  error?: string | null;
}) {
  const [visible, setVisible] = useState(false);
  const errorId = useId();

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
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${inputCls} pr-11 ${error ? inputErrorCls : ""} ${className}`}
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

  const errorNode = error && <FieldError id={errorId} message={error} />;

  if (!label) {
    return (
      <>
        {field}
        {errorNode}
      </>
    );
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-admin-label font-medium text-admin-text-2">
        {label}
        {required && <RequiredMark />}
      </span>
      {field}
      {errorNode}
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
}) {
  const errorId = useId();
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-admin-label font-medium text-admin-text-2">
        {label}
        {required && <RequiredMark />}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${inputCls} resize-none ${error ? inputErrorCls : ""}`}
      />
      {error && <FieldError id={errorId} message={error} />}
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
  disabled,
}: {
  state: SaveState;
  label?: string;
  onClick?: () => void;
  /** Optional extra disable condition on top of the built-in "saving" lock —
   * e.g. pass `!isDirty` so there's nothing to click when nothing changed, or
   * a validation-failed flag. Existing callers that don't pass this keep
   * their exact current behavior (only disabled while saving). */
  disabled?: boolean;
}) {
  const text = state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : label;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "saving" || disabled}
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

// ── Reorderable list support ─────────────────────────────────────────────────
// Shared by RepeatableFields.tsx and any editor with a locally-defined
// repeatable-row component (HomepageEditor, BookConsultationEditor) so the
// move-up/down + drag logic exists in exactly one place.

export function arrayMove<T>(arr: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length || from === to) return [...arr];
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/**
 * None of the repeatable-list item shapes in this app carry a persisted
 * unique id (they're plain `{title, text}`-style objects) — every render
 * would otherwise fall back to index-as-key, which is exactly what breaks
 * during a reorder (React reattaches a moved DOM node's state — including a
 * child MediaUploader's own in-flight upload state — to whichever index it
 * now occupies, not to the logical item that moved). This generates a
 * synthetic id per item, kept in lockstep with the array by the add/remove/
 * move handlers below rather than recomputed from content.
 */
export function useStableIds(count: number): string[] {
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: count }, () => crypto.randomUUID()));
  if (ids.length !== count) {
    if (ids.length < count) {
      setIds([...ids, ...Array.from({ length: count - ids.length }, () => crypto.randomUUID())]);
    } else {
      setIds(ids.slice(0, count));
    }
  }
  return ids;
}

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </svg>
  );
}

/**
 * Move-up/move-down wiring for a reorderable array — independent of how the
 * move is triggered (button click or a completed drag). One instance per
 * rendered list.
 */
export function useReorder<T>(items: T[], onChange: (items: T[]) => void) {
  function moveTo(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    onChange(arrayMove(items, from, to));
  }

  return { moveTo };
}

/**
 * Root cause of the original native-HTML5-drag implementation: dragover/drop
 * were bound only to the ~24×28px grip icon itself, so completing a drop
 * required releasing the pointer precisely on another row's equally tiny
 * grip — nearly impossible with a real mouse/trackpad, even though the event
 * wiring (preventDefault, drop handler, etc.) was technically correct. A
 * synthetic dragstart/dragover/drop dispatched directly at the target DOM
 * node sidesteps that precision requirement entirely, which is why it
 * appeared to work in automated testing but not for a real user.
 *
 * Native HTML5 drag-and-drop's cross-browser reliability (especially
 * Safari's long-standing quirks around custom drag images and dragover
 * firing) makes it a poor foundation to patch further, so the actual drag
 * interaction now uses @dnd-kit — pointer-based, not the native browser drag
 * session, with a much larger/forgiving drop-target (the whole row via
 * closestCenter collision detection, not one 6×7px icon). The move-up/down
 * buttons above are untouched: they never depended on native drag events.
 */
export function SortableList({
  ids,
  onReorder,
  children,
}: {
  /** Stable ids (from useStableIds), same order as the rendered items. */
  ids: string[];
  onReorder: (oldIndex: number, newIndex: number) => void;
  children: ReactNode;
}) {
  const sensors = useSensors(
    // A small activation distance so clicking the handle (e.g. via a
    // keyboard-triggered synthetic click, or an imprecise tap) doesn't
    // immediately start a drag — real dragging still feels instant.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(oldIndex, newIndex);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

// There is deliberately no shared `useSortableRow` wrapper hook here. An
// earlier version wrapped @dnd-kit/sortable's useSortable() in a custom hook
// returning { setNodeRef, style, handleProps, ... }, but eslint-plugin-
// react-hooks's newer React-Compiler-derived `refs` rule cannot trace
// ref-safety through an intermediate custom hook layer — it flagged every
// property read off the wrapper's return value as an unsafe ref access
// during render, even though setNodeRef is a plain callback (not a ref
// being dereferenced). Calling useSortable() directly inside each row
// component — the pattern dnd-kit's own docs use — avoids the false
// positive entirely. See RepeatableFields.tsx's Row, HomepageEditor.tsx's
// RepeatableCard, and BookConsultationEditor.tsx's SortableRow for the
// (small, ~10-line) inlined version each one uses.

/**
 * Move-up/move-down buttons — the primary, always-available, keyboard- and
 * touch-accessible way to reorder — plus a drag handle (dnd-kit-powered, see
 * SortableList/useSortableRow above) as a pointer enhancement on top. The
 * buttons alone fully satisfy reordering with no drag at all.
 */
export function ReorderControls({
  label,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  handleProps,
}: {
  /** Item name announced in the button's accessible label, e.g. "step 2". */
  label: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  handleProps?: React.HTMLAttributes<HTMLSpanElement>;
}) {
  const dragHandle = handleProps && (
    <span
      {...handleProps}
      aria-hidden="true"
      title="Drag to reorder"
      style={{ touchAction: "none" }}
      className="flex h-7 w-6 shrink-0 cursor-grab select-none items-center justify-center rounded text-admin-text-3 transition-colors duration-200 ease-admin hover:text-admin-text active:cursor-grabbing"
    >
      <GripIcon />
    </span>
  );

  return (
    <div className="flex items-center gap-0.5">
      {dragHandle}
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        aria-label={`Move ${label} up`}
        className="flex h-7 w-7 items-center justify-center rounded text-admin-text-3 transition-colors duration-200 ease-admin hover:bg-admin-surface-2 hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronUpIcon />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        aria-label={`Move ${label} down`}
        className="flex h-7 w-7 items-center justify-center rounded text-admin-text-3 transition-colors duration-200 ease-admin hover:bg-admin-surface-2 hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronDownIcon />
      </button>
    </div>
  );
}
