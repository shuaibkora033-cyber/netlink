import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Services } from "@/components/Services";
import { GrowthSystem } from "@/components/GrowthSystem";
import { Industries } from "@/components/Industries";
import { CaseStudies } from "@/components/CaseStudies";
import { Contact } from "@/components/Contact";
import { getHomepageContent, getCaseStudies } from "@/lib/data/homepage";
import { getThemeSettings } from "@/lib/data/theme";

// Without this, Next prerenders "/" once at build time (no cookies/headers/
// searchParams are used here to trigger dynamic rendering automatically),
// so admin edits saved to Supabase after the build never reach visitors —
// the same frozen HTML keeps being served under `next start` until the next
// rebuild. Forcing dynamic rendering makes every request re-run the Supabase
// reads below, so saved changes go live immediately with no rebuild.
export const dynamic = "force-dynamic";

// Gateway homepage: a short preview of each deeper page (full detail lives
// on /lead-generation, /appointment-setting, /process, /industries,
// /results) plus the final CTA/contact form. Still fully Supabase-driven
// and admin-editable via /admin/homepage and /admin/theme, unchanged.
export default async function Home() {
  const [content, caseStudies, theme] = await Promise.all([
    getHomepageContent(),
    getCaseStudies(),
    getThemeSettings(),
  ]);
  const show = theme.sectionVisibility;

  return (
    <>
      {/* 1 — Hero with rotating keyword */}
      <Hero content={content} />

      {/* 2 — Short problem overview */}
      {show.problem && <Problem />}

      {/* 3 — Short solution overview */}
      {show.services && <Services />}

      {/* 4 — Short process preview */}
      {show.growthSystem && <GrowthSystem steps={content.growthSteps} />}

      {/* 5 — Short industries preview */}
      {show.industries && <Industries items={content.industries} />}

      {/* 6 — Short results preview */}
      {show.caseStudies && <CaseStudies items={caseStudies} />}

      {/* 7 — Final CTA + contact form */}
      {show.contact && (
        <Contact
          finalCta={content.finalCta}
          contactEmail={theme.contactEmail}
          phoneNumber={theme.phoneNumber}
          buttonText={theme.buttonText}
        />
      )}
    </>
  );
}
