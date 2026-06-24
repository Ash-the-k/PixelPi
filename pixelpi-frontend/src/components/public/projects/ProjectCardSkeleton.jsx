export function ProjectCardSkeleton() {
  return (
    <div
      className="rounded-lg overflow-hidden aspect-[4/3] animate-pulse"
      style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
    />
  );
}