/**
 * Ambient animated glow orbs + dotted grid.
 * Pure CSS animation (no JS) for performance. Server component.
 *
 * overflow-clip (not overflow-hidden) is used on the wrapper so that
 * transformed children (scale in the glow keyframe) are reliably clipped
 * at the container boundary on all browsers including iOS Safari.
 */
export function GlowBackground({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-clip ${className}`}
    >
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute -top-32 left-1/4 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-neon/20 blur-[140px] animate-glow" />
      {/* Right orb: right-0 only — no translate-x offset that would extend past the container */}
      <div
        className="absolute top-1/3 right-0 h-[34rem] w-[34rem] rounded-full bg-cyan/15 blur-[130px] animate-glow"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-electric/10 blur-[120px] animate-glow"
        style={{ animationDelay: "-6s" }}
      />
    </div>
  );
}
