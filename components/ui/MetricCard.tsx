import { Reveal } from "./Reveal";
import { MetricValue } from "./MetricValue";

type MetricCardProps = {
  index: number;
  value: string;
  label: string;
};

/** Animated big-number stat tile for the /results metrics grid. */
export function MetricCard({ index, value, label }: MetricCardProps) {
  return (
    <Reveal index={index} className="h-full">
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-line glass px-4 py-8 text-center">
        <span className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
          <MetricValue raw={value} />
        </span>
        <span className="text-xs leading-tight text-muted sm:text-sm">{label}</span>
      </div>
    </Reveal>
  );
}
