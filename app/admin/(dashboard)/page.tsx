import Link from "next/link";

const LINKS = [
  { href: "/admin/leads", title: "Leads", description: "Consultation requests submitted through /book-consultation." },
  { href: "/admin/homepage", title: "Homepage", description: "Hero, stats, growth steps, and the final CTA." },
  { href: "/admin/pages/lead-generation", title: "Lead Generation", description: "Edit the /lead-generation page." },
  { href: "/admin/pages/appointment-setting", title: "Appointment Setting", description: "Edit the /appointment-setting page." },
  { href: "/admin/pages/process", title: "Process", description: "Edit the /process page." },
  { href: "/admin/pages/industries", title: "Industries", description: "Shared industry cards — feeds the homepage grid and /industries." },
  { href: "/admin/pages/results", title: "Results", description: "Edit the /results page." },
  { href: "/admin/pages/about", title: "About", description: "Edit the /about page." },
  { href: "/admin/pages/book-consultation", title: "Book Consultation", description: "Edit the /book-consultation page and form." },
  { href: "/admin/services", title: "Services", description: "The homepage's solution grid cards." },
  { href: "/admin/clients", title: "Clients", description: "Client logo marquee data." },
  { href: "/admin/faqs", title: "FAQs", description: "The FAQ question/answer list." },
  { href: "/admin/case-studies", title: "Case Studies / Results", description: "Shared with the homepage and /results." },
  { href: "/admin/theme", title: "Theme & settings", description: "Colors, button labels, section visibility, and contact details." },
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
