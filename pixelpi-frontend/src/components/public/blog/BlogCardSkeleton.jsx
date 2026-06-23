export function BlogCardSkeleton() {
  return (
    <div
      className="rounded-lg overflow-hidden animate-pulse"
      style={{ border: '1px solid var(--color-border)', background: 'rgba(13,18,32,0.70)' }}
    >
      <div className="aspect-video" style={{ background: 'var(--color-bg-subtle)' }} />
      <div className="p-6 space-y-3">
        <div className="h-5 w-20 rounded-sm" style={{ background: 'var(--color-bg-subtle)' }} />
        <div className="h-7 w-3/4 rounded-sm" style={{ background: 'var(--color-bg-subtle)' }} />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-sm" style={{ background: 'var(--color-bg-subtle)' }} />
          <div className="h-4 w-5/6 rounded-sm" style={{ background: 'var(--color-bg-subtle)' }} />
        </div>
        <div className="flex gap-4 pt-2">
          <div className="h-3 w-16 rounded-sm" style={{ background: 'var(--color-bg-subtle)' }} />
          <div className="h-3 w-24 rounded-sm" style={{ background: 'var(--color-bg-subtle)' }} />
        </div>
      </div>
    </div>
  );
}