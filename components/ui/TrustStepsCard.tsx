import { Reveal } from "./Reveal";

/**
 * Compact "What happens after you submit?" reassurance box placed directly
 * beside/under the form on /book-consultation — reinforces trust right at
 * the point of conversion, distinct from the fuller qualification copy
 * elsewhere on the page.
 */
export function TrustStepsCard({
  title,
  steps,
  footer,
}: {
  title: string;
  steps: string[];
  footer: string;
}) {
  return (
    <Reveal>
      <div className="rounded-2xl border border-cyan/15 bg-white/[0.02] p-5 sm:p-6">
        <h3 className="text-sm font-semibold tracking-tight text-fg">{title}</h3>
        <ol className="mt-4 flex flex-col gap-3">
          {steps.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan/30 bg-cyan/8 text-[0.65rem] font-semibold text-cyan">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-muted">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-line/60 pt-4 text-xs text-muted/70">{footer}</p>
      </div>
    </Reveal>
  );
}
