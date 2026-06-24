export function ProjectCardSkeleton() {
  return (
    <div
      className="rounded-lg overflow-hidden animate-pulse"
      style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
    >
      <div className="aspect-[4/3]" style={{ background: 'var(--color-bg-subtle)' }} />
      <div className="p-5 space-y-3">
        <div className="h-6 w-3/4 rounded-sm" style={{ background: 'var(--color-bg-subtle)' }} />
        <div className="h-4 w-full rounded-sm" style={{ background: 'var(--color-bg-subtle)' }} />
        <div className="h-4 w-2/3 rounded-sm" style={{ background: 'var(--color-bg-subtle)' }} />
      </div>
    </div>
  );
}