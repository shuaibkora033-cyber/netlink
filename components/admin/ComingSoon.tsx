export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">{title}</h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
        <p className="text-sm text-muted">Coming in Phase 2.</p>
      </div>
    </div>
  );
}
