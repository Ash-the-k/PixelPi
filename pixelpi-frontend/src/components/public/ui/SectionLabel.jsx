import { cn } from '../../../utils/cn';

export function SectionLabel({ children, className }) {
  return (
    <p
      className={cn(
        'font-mono text-mono-sm uppercase tracking-widest',
        className
      )}
      style={{ color: 'var(--color-text-muted)' }}
    >
      {children}
    </p>
  );
}