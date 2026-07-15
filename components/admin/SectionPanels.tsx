"use client";

import { ItemListField, StringListField, type ItemFieldSpec } from "./RepeatableFields";
import { Panel, TextField, TextAreaField, SaveButton, StatusMessage, UnsavedBadge, type SaveState } from "./ui";

type PanelChrome = {
  saveState: SaveState;
  error: string | null;
  dirty: boolean;
  onSave: () => void;
};

export type HeroContent = { eyebrow: string; title: string; subtitle: string };

/** Shared "eyebrow / headline / subheadline" hero editor — used at the top of every page editor. */
export function HeroPanel({
  data,
  onChange,
  ...chrome
}: PanelChrome & { data: HeroContent; onChange: (v: HeroContent) => void }) {
  return (
    <Panel
      title="Hero"
      description="The top of the page — badge, headline, and subheadline."
      headerAction={
        <div className="flex items-center gap-2">
          <UnsavedBadge show={chrome.dirty} />
          <SaveButton state={chrome.saveState} label="Save Hero" onClick={chrome.onSave} />
        </div>
      }
    >
      <TextField label="Badge text" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextField label="Headline" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <TextAreaField
        label="Subheadline"
        rows={3}
        value={data.subtitle}
        onChange={(v) => onChange({ ...data, subtitle: v })}
      />
      <StatusMessage state={chrome.saveState} error={chrome.error} />
    </Panel>
  );
}

export type ItemGridContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: Record<string, string>[];
};

/** Shared "eyebrow / title / subtitle + repeatable cards" editor (ServiceCardGrid-shaped sections). */
export function ItemGridPanel({
  title,
  description,
  data,
  onChange,
  itemFields = [
    { key: "title", label: "Title" },
    { key: "text", label: "Text", type: "textarea" },
  ],
  emptyItem = { title: "", text: "" },
  ...chrome
}: PanelChrome & {
  title: string;
  description: string;
  data: ItemGridContent;
  onChange: (v: ItemGridContent) => void;
  itemFields?: ItemFieldSpec[];
  emptyItem?: Record<string, string>;
}) {
  return (
    <Panel
      title={title}
      description={description}
      headerAction={
        <div className="flex items-center gap-2">
          <UnsavedBadge show={chrome.dirty} />
          <SaveButton state={chrome.saveState} label={`Save ${title}`} onClick={chrome.onSave} />
        </div>
      }
    >
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextField label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <TextAreaField
        label="Subtitle"
        rows={2}
        value={data.subtitle}
        onChange={(v) => onChange({ ...data, subtitle: v })}
      />
      <ItemListField
        label="Cards"
        items={data.items}
        emptyItem={emptyItem}
        itemFields={itemFields}
        onChange={(items) => onChange({ ...data, items })}
      />
      <StatusMessage state={chrome.saveState} error={chrome.error} />
    </Panel>
  );
}

export type BulletsContent = { eyebrow: string; title: string; text: string; bullets: string[] };

/** Shared "eyebrow / title / text + bullet list" editor (DashboardReporting-shaped sections). */
export function BulletsPanel({
  title,
  description,
  data,
  onChange,
  ...chrome
}: PanelChrome & { title: string; description: string; data: BulletsContent; onChange: (v: BulletsContent) => void }) {
  return (
    <Panel
      title={title}
      description={description}
      headerAction={
        <div className="flex items-center gap-2">
          <UnsavedBadge show={chrome.dirty} />
          <SaveButton state={chrome.saveState} label={`Save ${title}`} onClick={chrome.onSave} />
        </div>
      }
    >
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextField label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <TextAreaField label="Text" rows={2} value={data.text} onChange={(v) => onChange({ ...data, text: v })} />
      <StringListField label="Bullets" items={data.bullets} onChange={(bullets) => onChange({ ...data, bullets })} />
      <StatusMessage state={chrome.saveState} error={chrome.error} />
    </Panel>
  );
}

export type FinalCtaContent = { eyebrow: string; title: string; text: string; buttonText: string; href: string };

/** Shared final-CTA editor — used at the bottom of every page editor. */
export function FinalCtaPanel({
  data,
  onChange,
  ...chrome
}: PanelChrome & { data: FinalCtaContent; onChange: (v: FinalCtaContent) => void }) {
  return (
    <Panel
      title="Final CTA"
      description="The closing call-to-action banner at the bottom of the page."
      headerAction={
        <div className="flex items-center gap-2">
          <UnsavedBadge show={chrome.dirty} />
          <SaveButton state={chrome.saveState} label="Save Final CTA" onClick={chrome.onSave} />
        </div>
      }
    >
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextField label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <TextAreaField label="Text" rows={2} value={data.text} onChange={(v) => onChange({ ...data, text: v })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Button text"
          value={data.buttonText}
          onChange={(v) => onChange({ ...data, buttonText: v })}
        />
        <TextField label="Button link" value={data.href} onChange={(v) => onChange({ ...data, href: v })} />
      </div>
      <StatusMessage state={chrome.saveState} error={chrome.error} />
    </Panel>
  );
}

export type SimpleTextContent = { eyebrow: string; title: string; text: string };

/** Shared "eyebrow / title / prose text" editor — plain sections with no cards or bullets. */
export function SimpleTextPanel({
  title,
  description,
  data,
  onChange,
  ...chrome
}: PanelChrome & { title: string; description: string; data: SimpleTextContent; onChange: (v: SimpleTextContent) => void }) {
  return (
    <Panel
      title={title}
      description={description}
      headerAction={
        <div className="flex items-center gap-2">
          <UnsavedBadge show={chrome.dirty} />
          <SaveButton state={chrome.saveState} label={`Save ${title}`} onClick={chrome.onSave} />
        </div>
      }
    >
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextField label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <TextAreaField label="Text" rows={3} value={data.text} onChange={(v) => onChange({ ...data, text: v })} />
      <StatusMessage state={chrome.saveState} error={chrome.error} />
    </Panel>
  );
}
