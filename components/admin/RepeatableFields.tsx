"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  TextField,
  TextAreaField,
  IconButton,
  ReorderControls,
  SortableList,
  useStableIds,
  useReorder,
  arrayMove,
} from "./ui";

function Row({
  onRemove,
  reorder,
  children,
}: {
  onRemove: () => void;
  // Both callers of this Row (ItemListField, StringListField) always pass
  // reorder — every list built from them is order-sensitive on the public
  // site (confirmed per-array before Phase 5). Required, not optional, so
  // useSortableRow below can be called unconditionally (rules of hooks).
  reorder: {
    label: string;
    onMoveUp: () => void;
    onMoveDown: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
    id: string;
  };
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: reorder.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: "relative",
      }}
      className={`rounded-xl border border-admin-border bg-admin-surface p-4 ${isDragging ? "select-none" : ""}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">{children}</div>
      <div className="mt-3 flex items-center justify-between">
        <ReorderControls
          label={reorder.label}
          onMoveUp={reorder.onMoveUp}
          onMoveDown={reorder.onMoveDown}
          canMoveUp={reorder.canMoveUp}
          canMoveDown={reorder.canMoveDown}
          handleProps={{ ...attributes, ...listeners }}
        />
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
  const ids = useStableIds(items.length);
  const { moveTo } = useReorder(items, onChange);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-admin-label font-medium text-admin-text-2">{label}</span>
      <SortableList ids={ids} onReorder={(from, to) => onChange(arrayMove(items, from, to))}>
        {items.map((item, i) => (
          <Row
            key={ids[i]}
            onRemove={() => onChange(items.filter((_, idx) => idx !== i))}
            reorder={{
              id: ids[i],
              label: `${label.toLowerCase()} ${i + 1}`,
              onMoveUp: () => moveTo(i, i - 1),
              onMoveDown: () => moveTo(i, i + 1),
              canMoveUp: i > 0,
              canMoveDown: i < items.length - 1,
            }}
          >
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
      </SortableList>
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
  const ids = useStableIds(items.length);
  const { moveTo } = useReorder(items, onChange);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-admin-label font-medium text-admin-text-2">{label}</span>
      <SortableList ids={ids} onReorder={(from, to) => onChange(arrayMove(items, from, to))}>
        {items.map((value, i) => (
          <Row
            key={ids[i]}
            onRemove={() => onChange(items.filter((_, idx) => idx !== i))}
            reorder={{
              id: ids[i],
              label: `item ${i + 1}`,
              onMoveUp: () => moveTo(i, i - 1),
              onMoveDown: () => moveTo(i, i + 1),
              canMoveUp: i > 0,
              canMoveDown: i < items.length - 1,
            }}
          >
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
      </SortableList>
      <IconButton label={`+ Add item`} onClick={() => onChange([...items, ""])} />
    </div>
  );
}
