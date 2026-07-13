import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Hero } from "@/components/Hero";
import { ClientsLogos } from "@/components/ClientsLogos";
import { GoogleRatingStrip } from "@/components/GoogleRatingStrip";
import { Problem } from "@/components/Problem";
import { Services } from "@/components/Services";
import { GrowthSystem } from "@/components/GrowthSystem";
import { Industries } from "@/components/Industries";
import { CaseStudies } from "@/components/CaseStudies";
import { GoogleReviews } from "@/components/GoogleReviews";
import { WhyChoose } from "@/components/WhyChoose";
import { FAQ } from "@/components/FAQ";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { getHomepageContent, getCaseStudies } from "@/lib/data/homepage";
import { getThemeSettings } from "@/lib/data/theme";

export default async function Home() {
  const [content, caseStudies, theme] = await Promise.all([
    getHomepageContent(),
    getCaseStudies(),
    getThemeSettings(),
  ]);
  const show = theme.sectionVisibility;

  return (
    <>
      <Navbar navbarCtaText={theme.navbarCtaText} />
      <BottomNav />
      {/* pb-28 on mobile so the last section isn't hidden behind the fixed bottom nav.
          lg:pb-0 removes it on desktop where the bottom nav is hidden. */}
      <main className="pb-28 lg:pb-0">
        {/* 1 — Hero with rotating keyword */}
        <Hero content={content} />

        {/* 2 — Trusted client logos marquee */}
        {show.clients && <ClientsLogos />}

        {/* 3 — Google rating strip */}
        {show.googleRating && <GoogleRatingStrip />}

        {/* 4 — Problem / pain points */}
        {show.problem && <Problem />}

        {/* 5 — Services bento grid (9 services) */}
        {show.services && <Services />}

        {/* 6 — Netlink growth system (4-step process) */}
        {show.growthSystem && <GrowthSystem steps={content.growthSteps} />}

        {/* 7 — Industries we serve */}
        {show.industries && <Industries items={content.industries} />}

        {/* 8 — Featured case studies / results */}
        {show.caseStudies && <CaseStudies items={caseStudies} />}

        {/* 9 — Google reviews (real API or demo fallback) */}
        {show.googleReviews && <GoogleReviews />}

        {/* 10 — Why Netlink */}
        {show.whyChoose && <WhyChoose />}

        {/* 11 — FAQ accordion */}
        {show.faq && <FAQ />}

        {/* 12 — Final CTA + contact form */}
        {show.contact && (
          <Contact
            finalCta={content.finalCta}
            contactEmail={theme.contactEmail}
            phoneNumber={theme.phoneNumber}
            buttonText={theme.buttonText}
          />
        )}
      </main>
      <Footer
        contactEmail={theme.contactEmail}
        phoneNumber={theme.phoneNumber}
        socialLinks={theme.socialLinks}
      />
    </>
  );
}
