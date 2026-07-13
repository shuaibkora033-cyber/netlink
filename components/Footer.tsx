import { nav, site } from "@/lib/content";
import { toTelHref } from "@/lib/data/theme";
import { Logo } from "./ui/Logo";

const services = [
  "Lead Generation",
  "Appointment Setting",
  "Web Development",
  "Performance Marketing",
  "Google Ads",
  "Branding",
];

export function Footer({
  contactEmail,
  phoneNumber,
  socialLinks,
}: {
  contactEmail: string;
  phoneNumber: string;
  socialLinks: Record<string, string>;
}) {
  const year = 2026;
  return (
    <footer className="relative border-t border-line/60 bg-charcoal/30">
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-10">

          {/* Brand column */}
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {site.tagline}. We build high-converting websites and lead generation
              systems for service businesses ready to scale.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={socialLinks.instagram || site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Netlink on Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-all hover:border-neon/40 hover:text-neon"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
              </a>
              <a
                href={socialLinks.linkedin || site.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Netlink on LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-all hover:border-neon/40 hover:text-neon"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2V9zm2-6a2 2 0 110 4 2 2 0 010-4z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-muted">Explore</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-white/65 transition-colors hover:text-neon"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-muted">Services</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {services.map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="text-sm text-white/65 transition-colors hover:text-neon"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-muted">Contact</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-white/65 transition-colors hover:text-neon"
                >
                  {contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={toTelHref(phoneNumber)}
                  className="text-white/65 transition-colors hover:text-neon"
                >
                  {phoneNumber}
                </a>
              </li>
              <li className="pt-1">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 rounded-full border border-neon/30 bg-neon/8 px-4 py-2 text-xs font-medium text-neon transition-all hover:border-neon/60 hover:bg-neon/15"
                >
                  Free consultation →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line/60 pt-5 text-xs text-muted sm:mt-12 sm:flex-row sm:pt-6">
          <p>© {year} {site.name}. All rights reserved.</p>
          <p className="text-muted/60">Performance-driven digital growth for service businesses.</p>
        </div>
      </div>
    </footer>
  );
}
