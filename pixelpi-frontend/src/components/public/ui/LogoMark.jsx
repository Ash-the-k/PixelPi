import { cn } from '../../../utils/cn';

export function LogoMark({ size = 'md' }) {
  const sizes = {
    sm: { box: 'w-5 h-5', label: 'text-[13px]' },
    md: { box: 'w-6 h-6', label: 'text-[15px]' },    // 24px icon, 15px wordmark
    lg: { box: 'w-7 h-7', label: 'text-body-md' },   // footer / large contexts
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="inline-flex items-center gap-2 leading-none">
      <img
        src="/logo.png"
        alt=""
        className={cn(s.box, 'flex-shrink-0 object-contain block')}
        aria-hidden="true"
      />
      <span
        className={cn(
          'font-display font-semibold leading-none',
          'inline-flex items-center gap-[3px]',
          s.label,
        )}
      >
        <span style={{ color: 'var(--color-text-primary)' }}>Pixel</span>
        <span style={{ color: 'var(--color-accent-hover)' }}>Pi</span>
      </span>
    </div>
  );
}