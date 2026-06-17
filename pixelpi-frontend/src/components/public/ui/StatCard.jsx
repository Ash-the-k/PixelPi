import { cn } from '../../../utils/cn';

export function StatCard({ value, label, className }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span
        className="font-mono text-display-sm font-medium"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {value}
      </span>
      <span
        className="font-body text-label"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>
    </div>
  );
}