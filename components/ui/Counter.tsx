"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

type CounterProps = {
  value: number;
  suffix?: string;
  /** decimals to show (auto-detected from value if omitted) */
  decimals?: number;
};

/** Counts up from 0 to `value` the first time it scrolls into view. */
export function Counter({ value, suffix = "", decimals }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);
  const places = decimals ?? (Number.isInteger(value) ? 0 : 1);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1] as const,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toFixed(places)}
      {suffix}
    </span>
  );
}
