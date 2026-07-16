import type { Metadata } from "next";
import Link from "next/link";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { Reveal } from "@/components/ui/Reveal";
import { CtaButton } from "@/components/ui/CtaButton";
import { Logo } from "@/components/ui/Logo";

// Deliberately not indexed — this is a post-submit conversion page, not an
// SEO landing page. `follow: true` still lets crawlers follow the Home /
// Process links from here.
export const metadata: Metadata = {
  title: { absolute: "Thank You | Netlink" },
  description: "Your consultation request has been received.",
  robots: { index: false, follow: true },
};

const NEXT_STEPS = [
  "We review your current lead flow and business details.",
  "We check if Netlink is the right fit.",
  "We contact you to confirm the next step.",
];

/**
 * Landed on after a successful /book-consultation submission (redirected
 * from BookConsultationForm.tsx — see components/BookConsultationForm.tsx).
 * Deliberately outside the (marketing) route group / shared Navbar-Footer
 * chrome: a clean conversion page with only two ways forward, not a full
 * page to browse from.
 */
export default function ThankYouPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-clip px-4 py-16 sm:px-6">
      <GlowBackground />

      <Reveal>
        <Link href="/" aria-label="Netlink" className="mb-10 flex items-center justify-center">
          <Logo size="md" />
        </Link>
      </Reveal>

      <div className="flex max-w-xl flex-col items-center text-center">
        <Reveal index={1}>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-neon/25 bg-neon/5 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-neon">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
            Request received
          </span>
        </Reveal>

        <Reveal index={2}>
          <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
            Thank you — your request has been received.
          </h1>
        </Reveal>

        <Reveal index={3}>
          <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed text-muted sm:text-base">
            We&apos;ll review your business details and reach out within one business day to confirm
            your free growth consultation.
          </p>
        </Reveal>

        <Reveal index={4}>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <CtaButton href="/" className="w-full justify-center sm:w-auto">
              Back to Home
            </CtaButton>
            <CtaButton href="/process" variant="ghost" className="w-full justify-center sm:w-auto">
              Explore Our Process
            </CtaButton>
          </div>
        </Reveal>
      </div>

      <Reveal index={5}>
        <div className="mt-16 w-full max-w-xl rounded-2xl border border-line glass p-6 sm:p-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            What happens next
          </h2>
          <ol className="mt-5 flex flex-col gap-4">
            {NEXT_STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neon/25 bg-neon/8 text-xs font-semibold text-neon">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-white/85">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      {/*
        Conversion tracking goes here once GTM / Meta Pixel / GA4 are wired
        up — none exist in this codebase yet, so nothing fires today. When
        added, this becomes a small client component (e.g. <ThankYouTracking />)
        rendered below and fires once on mount, for example:
          "use client";
          useEffect(() => {
            window.gtag?.("event", "conversion", { send_to: "AW-XXXXXXX/YYYYYYY" });
            window.fbq?.("track", "Lead");
          }, []);
        Do not read personal fields (name/email/phone) into any tracking
        call — this page never receives them (no PII in the URL either).
      */}
    </div>
  );
}
