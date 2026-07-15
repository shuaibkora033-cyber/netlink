import Link from "next/link";
import { Reveal } from "./Reveal";
import { INDUSTRY_ICONS, DEFAULT_INDUSTRY_ICON } from "./industryIcons";

type IndustryCardProps = {
  index: number;
  id: string;
  name: string;
  problem: string;
  solution: string;
  ctaHref: string;
  ctaText?: string;
};

/** Industry detail card for the /industries grid — name, problem, how Netlink helps, CTA. */
export function IndustryCard({
  index,
  id,
  name,
  problem,
  solution,
  ctaHref,
  ctaText = "Book a free consultation",
}: IndustryCardProps) {
  return (
    <Reveal index={index % 4} className="h-full">
      <div className="group flex h-full flex-col rounded-2xl border border-line bg-white/[0.02] p-6 transition-all duration-300 hover:border-neon/30 hover:bg-neon/[0.03]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neon/20 bg-neon/8 text-neon transition-all duration-300 group-hover:border-neon/40 group-hover:bg-neon/15">
          {INDUSTRY_ICONS[id] ?? DEFAULT_INDUSTRY_ICON}
        </span>
        <h3 className="mt-4 text-lg font-semibold tracking-tight text-fg">{name}</h3>

        <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted/60">The problem</p>
            <p className="mt-1 text-muted">{problem}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neon/70">How Netlink helps</p>
            <p className="mt-1 text-white/80">{solution}</p>
          </div>
        </div>

        <Link
          href={ctaHref}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-neon transition-colors hover:text-neon/80"
        >
          {ctaText}
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </Reveal>
  );
}
