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

export default function Home() {
  return (
    <>
      <Navbar />
      <BottomNav />
      {/* pb-28 on mobile so the last section isn't hidden behind the fixed bottom nav.
          lg:pb-0 removes it on desktop where the bottom nav is hidden. */}
      <main className="pb-28 lg:pb-0">
        {/* 1 — Hero with rotating keyword */}
        <Hero />

        {/* 2 — Trusted client logos marquee */}
        <ClientsLogos />

        {/* 3 — Google rating strip */}
        <GoogleRatingStrip />

        {/* 4 — Problem / pain points */}
        <Problem />

        {/* 5 — Services bento grid (9 services) */}
        <Services />

        {/* 6 — Netlink growth system (4-step process) */}
        <GrowthSystem />

        {/* 7 — Industries we serve */}
        <Industries />

        {/* 8 — Featured case studies / results */}
        <CaseStudies />

        {/* 9 — Google reviews (real API or demo fallback) */}
        <GoogleReviews />

        {/* 10 — Why Netlink */}
        <WhyChoose />

        {/* 11 — FAQ accordion */}
        <FAQ />

        {/* 12 — Final CTA + contact form */}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
