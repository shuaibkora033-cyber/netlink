import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { getThemeSettings } from "@/lib/data/theme";

// Shared chrome for every public page (homepage + all subpages). Forced
// dynamic so Navbar/Footer contact info and CTA text — edited in
// /admin/theme — stay live on every route instead of getting baked in at
// build time on the now-static subpages.
export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const theme = await getThemeSettings();

  return (
    <>
      <Navbar navbarCtaText={theme.navbarCtaText} />
      <BottomNav />
      {/* pb-28 on mobile so the last section isn't hidden behind the fixed bottom nav.
          lg:pb-0 removes it on desktop where the bottom nav is hidden. */}
      <main className="pb-28 lg:pb-0">{children}</main>
      <Footer
        contactEmail={theme.contactEmail}
        phoneNumber={theme.phoneNumber}
        socialLinks={theme.socialLinks}
      />
    </>
  );
}
