import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { BookConsultationForm, DEFAULT_BOOK_CONSULTATION_FORM } from "@/components/BookConsultationForm";
import { bookConsultationPage } from "@/lib/content";
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

export default async function BookConsultationPage() {
  const sections = await getPageSections("book-consultation");

  const hero = pickSection(sections, "hero", bookConsultationPage.hero);
  const qualification = pickSection(sections, "qualification", {
    eyebrow: "",
    title: bookConsultationPage.qualification.title,
    text: bookConsultationPage.qualification.text,
    bullets: bookConsultationPage.qualification.bullets,
  });
  const formConfig = pickSection(sections, "formConfig", DEFAULT_BOOK_CONSULTATION_FORM);

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} />

      <section className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:gap-20">
        {/* Qualification copy */}
        <div className="lg:sticky lg:top-28">
          <Reveal>
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{qualification.title}</h2>
          </Reveal>
          <Reveal index={1}>
            <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted sm:text-base">
              {qualification.text}
            </p>
          </Reveal>
          <Reveal index={2}>
            <ul className="mt-6 flex flex-col gap-3 sm:mt-8 sm:gap-4">
              {qualification.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neon/12 text-neon ring-1 ring-neon/20">
                    <CheckIcon />
                  </span>
                  <span className="text-sm text-white/85 leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Form */}
        <Reveal index={1}>
          <BookConsultationForm config={formConfig} />
        </Reveal>
      </section>
    </>
  );
}
