"use client";

import { TextField, TextAreaField, IconButton } from "./ui";

function Row({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">{children}</div>
      <div className="mt-3 flex justify-end">
        <IconButton label="Remove" variant="danger" onClick={onRemove} />
      </div>
    </div>
  );
}

export type ItemFieldSpec = {
  key: string;
  label: string;
  type?: "text" | "textarea";
  width?: string; // e.g. "sm:w-24" for short fields like a step number
};

/**
 * Repeatable list of small objects (e.g. { title, text } or { num, title,
 * text }) — the shape used across every ServiceCardGrid / process-step /
 * metric section on the multi-page site. Generalizes the add/remove-card
 * pattern HomepageEditor.tsx already uses for growth steps and industries.
 */
export function ItemListField<T extends Record<string, string>>({
  label,
  items,
  onChange,
  itemFields,
  emptyItem,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  itemFields: ItemFieldSpec[];
  emptyItem: T;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium text-muted">{label}</span>
      {items.map((item, i) => (
        <Row key={i} onRemove={() => onChange(items.filter((_, idx) => idx !== i))}>
          {itemFields.map((f) => (
            <div key={f.key} className={f.width ?? "min-w-0 flex-1"}>
              {f.type === "textarea" ? (
                <TextAreaField
                  label={f.label}
                  rows={2}
                  value={item[f.key] ?? ""}
                  onChange={(v) => {
                    const next = [...items];
                    next[i] = { ...next[i], [f.key]: v };
                    onChange(next);
                  }}
                />
              ) : (
                <TextField
                  label={f.label}
                  value={item[f.key] ?? ""}
                  onChange={(v) => {
                    const next = [...items];
                    next[i] = { ...next[i], [f.key]: v };
                    onChange(next);
                  }}
                />
              )}
            </div>
          ))}
        </Row>
      ))}
      <IconButton label={`+ Add ${label.toLowerCase()}`} onClick={() => onChange([...items, emptyItem])} />
    </div>
  );
}

/** Repeatable list of plain strings (e.g. bullet points). */
export function StringListField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium text-muted">{label}</span>
      {items.map((value, i) => (
        <Row key={i} onRemove={() => onChange(items.filter((_, idx) => idx !== i))}>
          <div className="min-w-0 flex-1">
            <TextField
              label={`Item ${i + 1}`}
              value={value}
              onChange={(v) => {
                const next = [...items];
                next[i] = v;
                onChange(next);
              }}
            />
          </div>
        </Row>
      ))}
      <IconButton label={`+ Add item`} onClick={() => onChange([...items, ""])} />
    </div>
  );
}
