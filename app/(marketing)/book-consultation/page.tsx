import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ProofGuaranteesSection } from "@/components/ui/ProofGuaranteesSection";
import { VideoReelCard } from "@/components/ui/VideoReelCard";
import { FeedbackProofGrid, type FeedbackItem } from "@/components/ui/FeedbackProofGrid";
import { TrustStepsCard } from "@/components/ui/TrustStepsCard";
import { CTASection } from "@/components/ui/CTASection";
import {
  BookConsultationForm,
  DEFAULT_BOOK_CONSULTATION_FORM,
  DEFAULT_FIELD_LABELS,
  type FieldLabels,
} from "@/components/BookConsultationForm";
import { bookConsultationPage } from "@/lib/content";
import { proofGuarantees, proofVideo, proofFeedback, trustSteps } from "@/lib/proof";
import type { OptionLabelOverrides } from "@/lib/leads";
import { publicAssetExists } from "@/lib/publicAsset";
import { getPageSections, pickSection } from "@/lib/data/pageSections";

export const metadata: Metadata = {
  title: { absolute: "Book a Free Growth Consultation | Netlink" },
  description: "See whether Netlink is the right lead generation and appointment setting partner for your business.",
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
      <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DEFAULT_HERO = {
  eyebrow: bookConsultationPage.hero.eyebrow,
  title: bookConsultationPage.hero.title,
  subtitle: bookConsultationPage.hero.subtitle,
  primaryCtaText: "",
  backgroundUrl: "",
  backgroundType: "none" as "none" | "image" | "video",
};

const DEFAULT_WHAT_TO_EXPECT = {
  eyebrow: "",
  title: bookConsultationPage.qualification.title,
  text: bookConsultationPage.qualification.text,
  steps: bookConsultationPage.qualification.bullets.map((text) => ({ text, visible: true })),
};

const DEFAULT_GUARANTEES = {
  eyebrow: proofGuarantees.eyebrow,
  title: proofGuarantees.title,
  subtitle: proofGuarantees.subtitle,
  items: proofGuarantees.items.map((item) => ({ ...item, iconKey: "shield-check", visible: true })),
};

const DEFAULT_VIDEO_PROOF = {
  eyebrow: proofVideo.eyebrow,
  title: proofVideo.title,
  text: proofVideo.text,
  videoUrl: "",
  posterUrl: "",
  placeholderText: "Video walkthrough coming soon",
  visible: true,
};

const DEFAULT_FEEDBACK_UGC = {
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
};

const DEFAULT_TRUST_BOX = {
  title: trustSteps.title,
  steps: trustSteps.steps,
  footer: trustSteps.footer,
  visible: true,
};

const DEFAULT_FORM_SETTINGS: {
  formTitle: string;
  formNote: string;
  submitLabel: string;
  fieldLabels: FieldLabels;
  optionLabels: OptionLabelOverrides;
} = {
  ...DEFAULT_BOOK_CONSULTATION_FORM,
  fieldLabels: DEFAULT_FIELD_LABELS,
  optionLabels: {},
};

const DEFAULT_FINAL_CTA = {
  eyebrow: "Still deciding?",
  title: "See Exactly How The System Works Before You Commit To Anything",
  text: "Not ready to book yet? Take a look at how Netlink's lead generation and appointment setting process works, step by step.",
  buttonText: "See How It Works",
  href: "/process",
  visible: true,
};

export default async function BookConsultationPage() {
  const sections = await getPageSections("book-consultation");

  const hero = pickSection(sections, "hero", DEFAULT_HERO);
  const whatToExpect = pickSection(sections, "what_to_expect", DEFAULT_WHAT_TO_EXPECT);
  const guarantees = pickSection(sections, "guarantees", DEFAULT_GUARANTEES);
  const videoProof = pickSection(sections, "video_proof", DEFAULT_VIDEO_PROOF);
  const feedbackUgc = pickSection(sections, "feedback_ugc", DEFAULT_FEEDBACK_UGC);
  const trustBox = pickSection(sections, "trust_box", DEFAULT_TRUST_BOX);
  const formSettings = pickSection(sections, "form_settings", DEFAULT_FORM_SETTINGS);
  const finalCta = pickSection(sections, "final_cta", DEFAULT_FINAL_CTA);

  // Hero background: CMS-uploaded media only — no local-file fallback exists
  // for this field (it's new in this phase, unlike the proof media below).
  const heroBackgroundImageUrl = hero.backgroundType === "image" && hero.backgroundUrl ? hero.backgroundUrl : undefined;
  const heroBackgroundVideoUrl = hero.backgroundType === "video" && hero.backgroundUrl ? hero.backgroundUrl : undefined;

  // Resolved server-side so the page never renders a broken <video>/<Image>:
  // admin-uploaded Storage URL first, then the legacy public/proof/* local
  // file (if present), then the component's own placeholder.
  const videoSrc = videoProof.videoUrl || (publicAssetExists(proofVideo.videoPath) ? `/${proofVideo.videoPath}` : null);
  const posterSrc = videoProof.posterUrl || null;

  const visibleGuarantees = guarantees.items.filter((item) => item.visible);
  const visibleSteps = whatToExpect.steps.filter((step) => step.visible);

  const feedbackItems: FeedbackItem[] = feedbackUgc.items
    .filter((item) => item.visible)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    .map((item, i) => {
      // Local static fallback only makes sense for the built-in default
      // items at their original index — admin-added cards beyond that have
      // no matching local file, so they just render without an image.
      const fallbackPath = proofFeedback.items[i]?.screenshotPath;
      const screenshotSrc = item.imageUrl
        ? item.imageUrl
        : fallbackPath && publicAssetExists(fallbackPath)
          ? `/${fallbackPath}`
          : null;
      return {
        source: item.source,
        quote: item.quote,
        name: item.name || undefined,
        role: item.role,
        screenshotSrc,
      };
    });

  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        primaryCta={hero.primaryCtaText ? { text: hero.primaryCtaText, href: "#book-consultation-form" } : undefined}
        backgroundImageUrl={heroBackgroundImageUrl}
        backgroundVideoUrl={heroBackgroundVideoUrl}
      />

      {visibleSteps.length > 0 && (
        <section className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
          <SectionHeading eyebrow={whatToExpect.eyebrow} title={whatToExpect.title} subtitle={whatToExpect.text} />
          <ul className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:mt-10 sm:gap-4">
            {visibleSteps.map((step, i) => (
              <Reveal key={i} index={i} as="li" className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neon/12 text-neon ring-1 ring-neon/20">
                  <CheckIcon />
                </span>
                <span className="text-sm leading-relaxed text-white/85">{step.text}</span>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {visibleGuarantees.length > 0 && (
        <ProofGuaranteesSection
          eyebrow={guarantees.eyebrow}
          title={guarantees.title}
          subtitle={guarantees.subtitle}
          items={visibleGuarantees.map((item) => ({ title: item.title, text: item.text }))}
        />
      )}

      {feedbackItems.length > 0 && (
        <FeedbackProofGrid eyebrow={feedbackUgc.eyebrow} title={feedbackUgc.title} text={feedbackUgc.text} items={feedbackItems} />
      )}

      <section
        id="book-consultation-form"
        className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 py-14 sm:px-6 md:py-20 lg:flex-row lg:items-start lg:gap-12"
      >
        {videoProof.visible && (
          <div className="lg:w-[320px] lg:shrink-0">
            <VideoReelCard
              eyebrow={videoProof.eyebrow}
              title={videoProof.title}
              text={videoProof.text}
              videoSrc={videoSrc}
              posterSrc={posterSrc}
              placeholderText={videoProof.placeholderText}
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-6">
          <Reveal>
            <BookConsultationForm
              config={{ formTitle: formSettings.formTitle, formNote: formSettings.formNote, submitLabel: formSettings.submitLabel }}
              fieldLabels={formSettings.fieldLabels}
              optionLabelOverrides={formSettings.optionLabels}
            />
          </Reveal>
          {trustBox.visible && (
            <TrustStepsCard title={trustBox.title} steps={trustBox.steps} footer={trustBox.footer} />
          )}
        </div>
      </section>

      {finalCta.visible && (
        <CTASection
          eyebrow={finalCta.eyebrow}
          title={finalCta.title}
          text={finalCta.text}
          buttonText={finalCta.buttonText || DEFAULT_FINAL_CTA.buttonText}
          href={finalCta.href || DEFAULT_FINAL_CTA.href}
        />
      )}
    </>
  );
}
