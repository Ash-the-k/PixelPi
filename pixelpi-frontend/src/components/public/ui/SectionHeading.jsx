import { cn } from '../../../utils/cn';

export function SectionHeading({ children, as: Tag = 'h2', className }) {
  return (
    <Tag
      className={cn(
        'font-display text-display-lg',
        className
      )}
      style={{ color: 'var(--color-text-primary)' }}
    >
      {children}
    </Tag>
  );
}