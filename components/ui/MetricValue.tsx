"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

// Parses strings like "3.8×", "−54%", "+180%", "212", "4.1×", "2.3 s"
export function parseMetric(raw: string): {
  prefix: string;
  value: number;
  suffix: string;
  decimals: number;
} {
  const match = raw.match(/^([^0-9]*)([\d.]+)(.*)$/);
  if (!match) return { prefix: "", value: 0, suffix: raw, decimals: 0 };
  const num = parseFloat(match[2]);
  return {
    prefix: match[1],
    value: num,
    suffix: match[3],
    decimals: match[2].includes(".") ? 1 : 0,
  };
}

/** Animates a metric string (e.g. "312", "−58%", "4.2×") from 0 once it scrolls into view. */
export function MetricValue({ raw }: { raw: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { prefix, value, suffix, decimals } = parseMetric(raw);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1] as const,
      onUpdate: (v) => setDisplay(v),
    });
    return () => c.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
