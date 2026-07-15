"use client";

import { bookConsultationPage } from "@/lib/content";
import { DEFAULT_BOOK_CONSULTATION_FORM, type BookConsultationFormConfig } from "@/components/BookConsultationForm";
import { usePageSections, isSectionDirty } from "@/components/admin/useContentSections";
import { StringListField } from "@/components/admin/RepeatableFields";
import { HeroPanel, BulletsPanel, type HeroContent, type BulletsContent } from "@/components/admin/SectionPanels";
import {
  Panel,
  TextField,
  TextAreaField,
  SaveButton,
  StatusMessage,
  UnsavedBadge,
} from "@/components/admin/ui";

const PAGE_SLUG = "book-consultation";

const FALLBACKS = {
  hero: bookConsultationPage.hero as HeroContent,
  qualification: {
    eyebrow: "",
    title: bookConsultationPage.qualification.title,
    text: bookConsultationPage.qualification.text,
    bullets: bookConsultationPage.qualification.bullets,
  } as BulletsContent,
  formConfig: DEFAULT_BOOK_CONSULTATION_FORM,
};

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

  const form = sections.formConfig.data;
  function updateForm(patch: Partial<BookConsultationFormConfig>) {
    update("formConfig", { ...form, ...patch });
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

      <HeroPanel
        data={sections.hero.data}
        saveState={sections.hero.saveState}
        error={sections.hero.error}
        dirty={isSectionDirty(sections.hero)}
        onChange={(v) => update("hero", v)}
        onSave={() => save("hero")}
      />

      <BulletsPanel
        title="Qualification Copy"
        description="What visitors see next to the form — title, intro text, and bullets."
        data={sections.qualification.data}
        saveState={sections.qualification.saveState}
        error={sections.qualification.error}
        dirty={isSectionDirty(sections.qualification)}
        onChange={(v) => update("qualification", v)}
        onSave={() => save("qualification")}
      />

      <Panel
        title="Form"
        description="Intro text, field labels/options, submit button text, and the success message."
        headerAction={
          <div className="flex items-center gap-2">
            <UnsavedBadge show={isSectionDirty(sections.formConfig)} />
            <SaveButton state={sections.formConfig.saveState} label="Save Form" onClick={() => save("formConfig")} />
          </div>
        }
      >
        <TextField label="Form title" value={form.formTitle} onChange={(v) => updateForm({ formTitle: v })} />
        <TextField label="Form note" value={form.formNote} onChange={(v) => updateForm({ formNote: v })} />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Name field label" value={form.nameLabel} onChange={(v) => updateForm({ nameLabel: v })} />
          <TextField label="Email field label" value={form.emailLabel} onChange={(v) => updateForm({ emailLabel: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Phone field label" value={form.phoneLabel} onChange={(v) => updateForm({ phoneLabel: v })} />
          <TextField label="Company field label" value={form.companyLabel} onChange={(v) => updateForm({ companyLabel: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Website field label" value={form.websiteLabel} onChange={(v) => updateForm({ websiteLabel: v })} />
          <TextField label="Service field label" value={form.serviceLabel} onChange={(v) => updateForm({ serviceLabel: v })} />
        </div>

        <StringListField
          label="Service options"
          items={form.serviceOptions}
          onChange={(serviceOptions) => updateForm({ serviceOptions })}
        />

        <TextField label="Budget field label" value={form.budgetLabel} onChange={(v) => updateForm({ budgetLabel: v })} />
        <StringListField
          label="Budget options"
          items={form.budgetOptions}
          onChange={(budgetOptions) => updateForm({ budgetOptions })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Notes field label" value={form.notesLabel} onChange={(v) => updateForm({ notesLabel: v })} />
          <TextField
            label="Notes placeholder"
            value={form.notesPlaceholder}
            onChange={(v) => updateForm({ notesPlaceholder: v })}
          />
        </div>

        <TextField label="Submit button text" value={form.submitLabel} onChange={(v) => updateForm({ submitLabel: v })} />

        <TextField label="Success title" value={form.successTitle} onChange={(v) => updateForm({ successTitle: v })} />
        <TextAreaField
          label="Success message"
          rows={2}
          value={form.successText}
          onChange={(v) => updateForm({ successText: v })}
        />

        <StatusMessage state={sections.formConfig.saveState} error={sections.formConfig.error} />
      </Panel>
    </div>
  );
}
