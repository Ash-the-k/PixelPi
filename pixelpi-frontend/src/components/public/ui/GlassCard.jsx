import { cn } from '../../../utils/cn';

export function GlassCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'glass-surface',
        'rounded-lg',
        'p-8',
        className
      )}
      style={{ border: '1px solid var(--color-border)' }}
      {...props}
    >
      {children}
    </div>
  );
}