import Link from "next/link";

const LINKS = [
  {
    href: "/admin/homepage",
    title: "Homepage",
    description: "Hero, stats, growth steps, industries, case studies, and the final CTA.",
  },
  {
    href: "/admin/theme",
    title: "Theme & settings",
    description: "Colors, button labels, section visibility, and contact details.",
  },
  {
    href: "/admin/services",
    title: "Services",
    description: "Coming in Phase 2.",
  },
  {
    href: "/admin/clients",
    title: "Clients",
    description: "Coming in Phase 2.",
  },
  {
    href: "/admin/faqs",
    title: "FAQs",
    description: "Coming in Phase 2.",
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">
          Edit your site&apos;s content and theme below — changes go live as soon as you save.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-2xl border border-line glass p-5 transition-all duration-200 hover:border-neon/30 hover:card-glow"
          >
            <h2 className="text-sm font-semibold text-fg transition-colors group-hover:text-neon">
              {link.title}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
