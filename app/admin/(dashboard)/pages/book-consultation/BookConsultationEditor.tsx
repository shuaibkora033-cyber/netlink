"use client";

import { bookConsultationPage } from "@/lib/content";
import { proofGuarantees, proofVideo, proofFeedback, trustSteps } from "@/lib/proof";
import { LEAD_OPTION_GROUPS, type LeadOptionFieldKey, type OptionLabelOverrides } from "@/lib/leads";
import { DEFAULT_FIELD_LABELS, type FieldLabels } from "@/components/BookConsultationForm";
import { usePageSections, isSectionDirty, type SectionState } from "@/components/admin/useContentSections";
import { StringListField } from "@/components/admin/RepeatableFields";
import { MediaUploader } from "@/components/admin/MediaUploader";
import {
  Panel,
  TextField,
  TextAreaField,
  ToggleField,
  SaveButton,
  StatusMessage,
  UnsavedBadge,
  IconButton,
  type SaveState,
} from "@/components/admin/ui";

const PAGE_SLUG = "book-consultation";

// ── Content shapes ───────────────────────────────────────────────────────────

type HeroContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  backgroundUrl: string;
  backgroundType: "none" | "image" | "video";
};

type WhatToExpectContent = {
  eyebrow: string;
  title: string;
  text: string;
  steps: { text: string; visible: boolean }[];
};

type GuaranteesContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: { title: string; text: string; iconKey: string; visible: boolean }[];
};

type VideoProofContent = {
  eyebrow: string;
  title: string;
  text: string;
  videoUrl: string;
  posterUrl: string;
  placeholderText: string;
  visible: boolean;
};

type FeedbackItemContent = {
  source: string;
  quote: string;
  name: string;
  role: string;
  imageUrl: string;
  visible: boolean;
  pinned: boolean;
};

type FeedbackUgcContent = {
  eyebrow: string;
  title: string;
  text: string;
  items: FeedbackItemContent[];
};

type TrustBoxContent = {
  title: string;
  steps: string[];
  footer: string;
  visible: boolean;
};

type FormSettingsContent = {
  formTitle: string;
  formNote: string;
  submitLabel: string;
  fieldLabels: FieldLabels;
  optionLabels: OptionLabelOverrides;
};

type FinalCtaContent = {
  eyebrow: string;
  title: string;
  text: string;
  buttonText: string;
  href: string;
  visible: boolean;
};

// ── Fallbacks (used to seed the editor until each section is saved once) ─────

const FALLBACKS = {
  hero: {
    eyebrow: bookConsultationPage.hero.eyebrow,
    title: bookConsultationPage.hero.title,
    subtitle: bookConsultationPage.hero.subtitle,
    primaryCtaText: "",
    backgroundUrl: "",
    backgroundType: "none",
  } as HeroContent,
  what_to_expect: {
    eyebrow: "",
    title: bookConsultationPage.qualification.title,
    text: bookConsultationPage.qualification.text,
    steps: bookConsultationPage.qualification.bullets.map((text) => ({ text, visible: true })),
  } as WhatToExpectContent,
  guarantees: {
    eyebrow: proofGuarantees.eyebrow,
    title: proofGuarantees.title,
    subtitle: proofGuarantees.subtitle,
    items: proofGuarantees.items.map((item) => ({ ...item, iconKey: "shield-check", visible: true })),
  } as GuaranteesContent,
  video_proof: {
    eyebrow: proofVideo.eyebrow,
    title: proofVideo.title,
    text: proofVideo.text,
    videoUrl: "",
    posterUrl: "",
    placeholderText: "Video walkthrough coming soon",
    visible: true,
  } as VideoProofContent,
  feedback_ugc: {
    eyebrow: proofFeedback.eyebrow,
    title: proofFeedback.title,
    text: proofFeedback.text,
    items: proofFeedback.items.map((item) => ({
      source: item.source,
      quote: item.quote,
      name: "",
      role: item.role,
      imageUrl: "",
      visible: true,
      pinned: false,
    })),
  } as FeedbackUgcContent,
  trust_box: {
    title: trustSteps.title,
    steps: trustSteps.steps,
    footer: trustSteps.footer,
    visible: true,
  } as TrustBoxContent,
  form_settings: {
    formTitle: "Book your free consultation",
    formNote: "No spam. We reply within one business day.",
    submitLabel: "Book Consultation",
    fieldLabels: DEFAULT_FIELD_LABELS,
    optionLabels: {},
  } as FormSettingsContent,
  final_cta: {
    eyebrow: "Still deciding?",
    title: "See Exactly How The System Works Before You Commit To Anything",
    text: "Not ready to book yet? Take a look at how Netlink's lead generation and appointment setting process works, step by step.",
    buttonText: "See How It Works",
    href: "/book-consultation",
    visible: true,
  } as FinalCtaContent,
};

// ── Small local repeatable-row helpers (need MediaUploader / toggle combos
// the shared RepeatableFields.tsx primitives don't cover) ───────────────────

function Row({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-4">
      <div className="flex flex-col gap-3">{children}</div>
      <div className="mt-3 flex justify-end">
        <IconButton label="Remove" variant="danger" onClick={onRemove} />
      </div>
    </div>
  );
}

function PanelChromeAction({ dirty, saveState, label, onSave }: { dirty: boolean; saveState: SaveState; label: string; onSave: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <UnsavedBadge show={dirty} />
      <SaveButton state={saveState} label={label} onClick={onSave} />
    </div>
  );
}

// ── Section panels ────────────────────────────────────────────────────────────

function HeroPanel({ section, onChange, onSave }: { section: SectionState<HeroContent>; onChange: (v: HeroContent) => void; onSave: () => void }) {
  const data = section.data;
  return (
    <Panel
      title="Hero"
      description="The top of the page — badge, headline, subheadline, and an optional background image or video."
      headerAction={<PanelChromeAction dirty={isSectionDirty(section)} saveState={section.saveState} label="Save Hero" onSave={onSave} />}
    >
      <TextField label="Badge text" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextField label="Headline" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <TextAreaField label="Subheadline" rows={3} value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <TextField
        label="Primary button text (optional)"
        value={data.primaryCtaText}
        onChange={(v) => onChange({ ...data, primaryCtaText: v })}
        placeholder="Leave blank to hide the button"
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">Background</span>
        <div className="flex gap-2">
          {(["none", "image", "video"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...data, backgroundType: t })}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                data.backgroundType === t
                  ? "border-neon/40 bg-neon/10 text-neon"
                  : "border-line bg-white/[0.02] text-muted hover:text-fg"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {data.backgroundType !== "none" && (
        <MediaUploader
          folder="backgrounds"
          accept={data.backgroundType}
          value={data.backgroundUrl}
          onChange={(url) => onChange({ ...data, backgroundUrl: url })}
        />
      )}

      <StatusMessage state={section.saveState} error={section.error} />
    </Panel>
  );
}

function WhatToExpectPanel({ section, onChange, onSave }: { section: SectionState<WhatToExpectContent>; onChange: (v: WhatToExpectContent) => void; onSave: () => void }) {
  const data = section.data;
  return (
    <Panel
      title="What To Expect"
      description="What visitors see explaining what happens on the call — title, intro text, and steps."
      headerAction={<PanelChromeAction dirty={isSectionDirty(section)} saveState={section.saveState} label="Save What To Expect" onSave={onSave} />}
    >
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextField label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <TextAreaField label="Text" rows={3} value={data.text} onChange={(v) => onChange({ ...data, text: v })} />

      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-muted">Steps</span>
        {data.steps.map((step, i) => (
          <Row key={i} onRemove={() => onChange({ ...data, steps: data.steps.filter((_, idx) => idx !== i) })}>
            <TextField
              label={`Step ${i + 1}`}
              value={step.text}
              onChange={(v) => {
                const steps = [...data.steps];
                steps[i] = { ...steps[i], text: v };
                onChange({ ...data, steps });
              }}
            />
            <ToggleField
              label="Visible"
              checked={step.visible}
              onChange={(v) => {
                const steps = [...data.steps];
                steps[i] = { ...steps[i], visible: v };
                onChange({ ...data, steps });
              }}
            />
          </Row>
        ))}
        <IconButton label="+ Add step" onClick={() => onChange({ ...data, steps: [...data.steps, { text: "", visible: true }] })} />
      </div>

      <StatusMessage state={section.saveState} error={section.error} />
    </Panel>
  );
}

function GuaranteesPanel({ section, onChange, onSave }: { section: SectionState<GuaranteesContent>; onChange: (v: GuaranteesContent) => void; onSave: () => void }) {
  const data = section.data;
  return (
    <Panel
      title="Guarantees"
      description={'Risk-reversal cards. Default copy is process-focused and legally safer — avoid guaranteeing sales, revenue, or lead volume.'}
      headerAction={<PanelChromeAction dirty={isSectionDirty(section)} saveState={section.saveState} label="Save Guarantees" onSave={onSave} />}
    >
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextField label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <TextAreaField label="Subtitle" rows={2} value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />

      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-muted">Cards</span>
        {data.items.map((it, i) => (
          <Row key={i} onRemove={() => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })}>
            <TextField
              label="Title"
              value={it.title}
              onChange={(v) => {
                const items = [...data.items];
                items[i] = { ...items[i], title: v };
                onChange({ ...data, items });
              }}
            />
            <TextAreaField
              label="Text"
              rows={2}
              value={it.text}
              onChange={(v) => {
                const items = [...data.items];
                items[i] = { ...items[i], text: v };
                onChange({ ...data, items });
              }}
            />
            <ToggleField
              label="Visible"
              checked={it.visible}
              onChange={(v) => {
                const items = [...data.items];
                items[i] = { ...items[i], visible: v };
                onChange({ ...data, items });
              }}
            />
          </Row>
        ))}
        <IconButton
          label="+ Add card"
          onClick={() => onChange({ ...data, items: [...data.items, { title: "", text: "", iconKey: "shield-check", visible: true }] })}
        />
      </div>

      <StatusMessage state={section.saveState} error={section.error} />
    </Panel>
  );
}

function VideoProofPanel({ section, onChange, onSave }: { section: SectionState<VideoProofContent>; onChange: (v: VideoProofContent) => void; onSave: () => void }) {
  const data = section.data;
  return (
    <Panel
      title="Video Proof"
      description="A short walkthrough video. Falls back to a 'coming soon' placeholder if no video is set."
      headerAction={<PanelChromeAction dirty={isSectionDirty(section)} saveState={section.saveState} label="Save Video Proof" onSave={onSave} />}
    >
      <ToggleField label="Show this section" checked={data.visible} onChange={(v) => onChange({ ...data, visible: v })} />
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextField label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <TextAreaField label="Text" rows={2} value={data.text} onChange={(v) => onChange({ ...data, text: v })} />
      <MediaUploader
        folder="videos"
        accept="video"
        label="Video"
        value={data.videoUrl}
        onChange={(url) => onChange({ ...data, videoUrl: url })}
      />
      <MediaUploader
        folder="proof"
        accept="image"
        label="Poster image (shown before play)"
        value={data.posterUrl}
        onChange={(url) => onChange({ ...data, posterUrl: url })}
      />
      <TextField
        label="Placeholder text (shown when no video is set)"
        value={data.placeholderText}
        onChange={(v) => onChange({ ...data, placeholderText: v })}
      />
      <StatusMessage state={section.saveState} error={section.error} />
    </Panel>
  );
}

function FeedbackUgcPanel({ section, onChange, onSave }: { section: SectionState<FeedbackUgcContent>; onChange: (v: FeedbackUgcContent) => void; onSave: () => void }) {
  const data = section.data;
  return (
    <Panel
      title="Feedback / UGC"
      description="Client feedback, call notes, and UGC snippets."
      headerAction={<PanelChromeAction dirty={isSectionDirty(section)} saveState={section.saveState} label="Save Feedback / UGC" onSave={onSave} />}
    >
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextField label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <TextAreaField label="Text" rows={2} value={data.text} onChange={(v) => onChange({ ...data, text: v })} />

      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-muted">Cards</span>
        {data.items.map((it, i) => {
          function updateItem(patch: Partial<FeedbackItemContent>) {
            const items = [...data.items];
            items[i] = { ...items[i], ...patch };
            onChange({ ...data, items });
          }
          return (
            <Row key={i} onRemove={() => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })}>
              <TextField label="Source label (e.g. Client Feedback, Call Note, UGC)" value={it.source} onChange={(v) => updateItem({ source: v })} />
              <TextAreaField label="Quote" rows={2} value={it.quote} onChange={(v) => updateItem({ quote: v })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Name (optional)" value={it.name} onChange={(v) => updateItem({ name: v })} />
                <TextField label="Role / company (optional)" value={it.role} onChange={(v) => updateItem({ role: v })} />
              </div>
              <MediaUploader
                folder={it.source === "UGC" ? "ugc" : "feedback"}
                accept="image"
                label="Image (optional)"
                value={it.imageUrl}
                onChange={(url) => updateItem({ imageUrl: url })}
              />
              <div className="flex flex-wrap gap-4">
                <ToggleField label="Visible" checked={it.visible} onChange={(v) => updateItem({ visible: v })} />
                <ToggleField label="Pinned (shown first)" checked={it.pinned} onChange={(v) => updateItem({ pinned: v })} />
              </div>
            </Row>
          );
        })}
        <IconButton
          label="+ Add card"
          onClick={() =>
            onChange({
              ...data,
              items: [...data.items, { source: "Client Feedback", quote: "", name: "", role: "", imageUrl: "", visible: true, pinned: false }],
            })
          }
        />
      </div>

      <StatusMessage state={section.saveState} error={section.error} />
    </Panel>
  );
}

function TrustBoxPanel({ section, onChange, onSave }: { section: SectionState<TrustBoxContent>; onChange: (v: TrustBoxContent) => void; onSave: () => void }) {
  const data = section.data;
  return (
    <Panel
      title="Form Trust Box"
      description="The compact reassurance box shown beside the form."
      headerAction={<PanelChromeAction dirty={isSectionDirty(section)} saveState={section.saveState} label="Save Trust Box" onSave={onSave} />}
    >
      <ToggleField label="Show this section" checked={data.visible} onChange={(v) => onChange({ ...data, visible: v })} />
      <TextField label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <StringListField label="Steps" items={data.steps} onChange={(steps) => onChange({ ...data, steps })} />
      <TextField label="Trust line" value={data.footer} onChange={(v) => onChange({ ...data, footer: v })} />
      <StatusMessage state={section.saveState} error={section.error} />
    </Panel>
  );
}

const OPTION_FIELD_LABELS: Record<LeadOptionFieldKey, string> = {
  service_needed: "Service needed",
  industry: "Industry",
  monthly_marketing_budget: "Monthly marketing budget",
  current_lead_source: "Current lead source",
  main_problem: "Main problem",
  preferred_contact_method: "Preferred contact method",
};

function FormSettingsPanel({ section, onChange, onSave }: { section: SectionState<FormSettingsContent>; onChange: (v: FormSettingsContent) => void; onSave: () => void }) {
  const data = section.data;

  function updateFieldLabel(key: keyof FieldLabels, value: string) {
    onChange({ ...data, fieldLabels: { ...data.fieldLabels, [key]: value } });
  }

  function updateOptionLabel(field: LeadOptionFieldKey, value: string, label: string) {
    onChange({
      ...data,
      optionLabels: {
        ...data.optionLabels,
        [field]: { ...data.optionLabels[field], [value]: label },
      },
    });
  }

  return (
    <Panel
      title="Form"
      description="Intro text, submit button text, field labels, and dropdown option labels. Option values are fixed in code because lead scoring depends on them — only the displayed label can be changed."
      headerAction={<PanelChromeAction dirty={isSectionDirty(section)} saveState={section.saveState} label="Save Form" onSave={onSave} />}
    >
      <TextField label="Form title" value={data.formTitle} onChange={(v) => onChange({ ...data, formTitle: v })} />
      <TextField label="Form note" value={data.formNote} onChange={(v) => onChange({ ...data, formNote: v })} />
      <TextField label="Submit button text" value={data.submitLabel} onChange={(v) => onChange({ ...data, submitLabel: v })} />

      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-muted">Field labels</span>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(DEFAULT_FIELD_LABELS) as (keyof FieldLabels)[]).map((key) => (
            <TextField
              key={key}
              label={DEFAULT_FIELD_LABELS[key]}
              value={data.fieldLabels[key] ?? DEFAULT_FIELD_LABELS[key]}
              onChange={(v) => updateFieldLabel(key, v)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-xs font-medium text-muted">Dropdown option labels</span>
        {(Object.keys(LEAD_OPTION_GROUPS) as LeadOptionFieldKey[]).map((field) => (
          <div key={field} className="rounded-xl border border-line bg-white/[0.02] p-4">
            <p className="mb-3 text-sm font-medium text-fg">{OPTION_FIELD_LABELS[field]}</p>
            <div className="flex flex-col gap-2">
              {LEAD_OPTION_GROUPS[field].map((opt) => (
                <div key={opt.value} className="grid grid-cols-[1fr_1.5fr] items-center gap-3">
                  <span className="truncate text-xs text-muted" title={opt.value}>{opt.value}</span>
                  <input
                    type="text"
                    value={data.optionLabels[field]?.[opt.value] ?? opt.label}
                    onChange={(e) => updateOptionLabel(field, opt.value, e.target.value)}
                    className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-fg outline-none transition-all duration-200 focus:border-neon/50"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <StatusMessage state={section.saveState} error={section.error} />
    </Panel>
  );
}

function FinalCtaPanel({ section, onChange, onSave }: { section: SectionState<FinalCtaContent>; onChange: (v: FinalCtaContent) => void; onSave: () => void }) {
  const data = section.data;
  return (
    <Panel
      title="Final CTA"
      description="The closing call-to-action banner at the bottom of the page."
      headerAction={<PanelChromeAction dirty={isSectionDirty(section)} saveState={section.saveState} label="Save Final CTA" onSave={onSave} />}
    >
      <ToggleField label="Show this section" checked={data.visible} onChange={(v) => onChange({ ...data, visible: v })} />
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextField label="Title" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      <TextAreaField label="Text" rows={2} value={data.text} onChange={(v) => onChange({ ...data, text: v })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Button text" value={data.buttonText} onChange={(v) => onChange({ ...data, buttonText: v })} />
        <TextField label="Button link" value={data.href} onChange={(v) => onChange({ ...data, href: v })} />
      </div>
      <StatusMessage state={section.saveState} error={section.error} />
    </Panel>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function BookConsultationEditor() {
  const { loadState, loadError, sections, update, save } = usePageSections(PAGE_SLUG, FALLBACKS);

  if (loadState === "loading") {
    return <p className="text-sm text-muted">Loading page content…</p>;
  }
  if (loadState === "error" || !sections) {
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
        {loadError || "Could not load page content."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Book Consultation</h1>
        <p className="mt-1 text-sm text-muted">
          Edits go live on /book-consultation immediately after saving — no rebuild needed. Each
          section below saves independently.
        </p>
      </div>

      <HeroPanel section={sections.hero} onChange={(v) => update("hero", v)} onSave={() => save("hero")} />
      <WhatToExpectPanel section={sections.what_to_expect} onChange={(v) => update("what_to_expect", v)} onSave={() => save("what_to_expect")} />
      <GuaranteesPanel section={sections.guarantees} onChange={(v) => update("guarantees", v)} onSave={() => save("guarantees")} />
      <VideoProofPanel section={sections.video_proof} onChange={(v) => update("video_proof", v)} onSave={() => save("video_proof")} />
      <FeedbackUgcPanel section={sections.feedback_ugc} onChange={(v) => update("feedback_ugc", v)} onSave={() => save("feedback_ugc")} />
      <TrustBoxPanel section={sections.trust_box} onChange={(v) => update("trust_box", v)} onSave={() => save("trust_box")} />
      <FormSettingsPanel section={sections.form_settings} onChange={(v) => update("form_settings", v)} onSave={() => save("form_settings")} />
      <FinalCtaPanel section={sections.final_cta} onChange={(v) => update("final_cta", v)} onSave={() => save("final_cta")} />
    </div>
  );
}
