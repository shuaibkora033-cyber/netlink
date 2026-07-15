"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { ThemeSettings } from "@/lib/data/theme";
import {
  Panel,
  TextField,
  ToggleField,
  SaveButton,
  StatusMessage,
  type SaveState,
} from "@/components/admin/ui";

type LoadState = "loading" | "ready" | "error";

const SECTION_LABELS: Record<string, string> = {
  clients: "Client logos marquee",
  googleRating: "Google rating strip",
  problem: "Problem / pain points",
  services: "Solution grid",
  growthSystem: "Process steps",
  industries: "Industries grid",
  caseStudies: "Case studies / results",
  googleReviews: "Google reviews",
  whyChoose: "Managed growth team",
  dashboardReporting: "Dashboard / reporting",
  faq: "FAQ accordion",
  contact: "Final CTA + contact form",
};

const SECTION_ORDER = Object.keys(SECTION_LABELS);

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="flex items-center gap-3">
        <span
          className="h-9 w-9 shrink-0 rounded-lg border border-line"
          style={{ backgroundColor: value }}
          aria-hidden
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-fg outline-none transition-all duration-200 focus:border-neon/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-neon/20"
        />
      </div>
    </label>
  );
}

export function ThemeEditor() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/theme");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load theme settings.");
        setTheme(data);
        setLoadState("ready");
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Failed to load theme settings.");
        setLoadState("error");
      }
    })();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!theme) return;
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setSaveState("saved");
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save.");
      setSaveState("error");
    }
  }

  if (loadState === "loading") {
    return <p className="text-sm text-muted">Loading theme settings…</p>;
  }
  if (loadState === "error" || !theme) {
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
        {loadError || "Could not load theme settings."}
      </p>
    );
  }

  function update<K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) {
    setTheme((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const t = theme;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Theme & settings</h1>
        <p className="mt-1 text-sm text-muted">
          Colors, button labels, section visibility, and contact details used across the site.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <Panel title="Colors">
          <div className="grid gap-4 sm:grid-cols-3">
            <ColorField label="Primary accent" value={t.primaryColor} onChange={(v) => update("primaryColor", v)} />
            <ColorField label="Secondary accent" value={t.secondaryColor} onChange={(v) => update("secondaryColor", v)} />
            <ColorField label="Background" value={t.backgroundColor} onChange={(v) => update("backgroundColor", v)} />
          </div>
        </Panel>

        <Panel title="Button labels">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="General button text" value={t.buttonText} onChange={(v) => update("buttonText", v)} />
            <TextField label="Navbar CTA text" value={t.navbarCtaText} onChange={(v) => update("navbarCtaText", v)} />
          </div>
        </Panel>

        <Panel title="Section visibility" description="Turn homepage sections on or off.">
          <div className="grid gap-2 sm:grid-cols-2">
            {SECTION_ORDER.map((key) => (
              <ToggleField
                key={key}
                label={SECTION_LABELS[key]}
                checked={t.sectionVisibility[key] ?? true}
                onChange={(v) => update("sectionVisibility", { ...t.sectionVisibility, [key]: v })}
              />
            ))}
          </div>
        </Panel>

        <Panel title="Contact details">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Contact email" value={t.contactEmail} onChange={(v) => update("contactEmail", v)} />
            <TextField label="Phone number" value={t.phoneNumber} onChange={(v) => update("phoneNumber", v)} />
          </div>
          <TextField
            label="WhatsApp link"
            value={t.whatsappLink}
            onChange={(v) => update("whatsappLink", v)}
            placeholder="https://wa.me/12025550123"
          />
        </Panel>

        <Panel title="Social links">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Instagram"
              value={t.socialLinks.instagram ?? ""}
              onChange={(v) => update("socialLinks", { ...t.socialLinks, instagram: v })}
            />
            <TextField
              label="LinkedIn"
              value={t.socialLinks.linkedin ?? ""}
              onChange={(v) => update("socialLinks", { ...t.socialLinks, linkedin: v })}
            />
          </div>
        </Panel>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SaveButton state={saveState} />
          <StatusMessage state={saveState} error={saveError} />
        </div>
      </form>
    </div>
  );
}
