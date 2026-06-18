import { cn } from '../../../utils/cn';

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  as: Tag = 'button',
  ...props
}) {
  const base = cn(
    'group',
    'inline-flex items-center justify-center gap-2',
    'font-body font-semibold text-label',
    'rounded-md',
    'border border-transparent',
    'transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'cursor-pointer border-0',
  );

  const sizes = {
    sm: 'px-4 h-9',   // 36px — used inside Navbar pill
    md: 'px-6 h-12',  // 48px — standard CTA
    lg: 'px-8 h-14',  // 56px — hero CTA on larger breakpoints
    pill: 'px-5 h-9 rounded-full text-[13px]',  // fits inside navbar pill
  };

  const variants = {
    primary: cn(
      'gradient-bg text-white',
      'hover:opacity-90 brightness-110 active:opacity-80 brightness-90',
      'focus-visible:ring-accent',
    ),
    secondary: cn(
      'bg-transparent text-accent',
      'border border-accent',
      'hover:bg-accent-subtle active:bg-accent-subtle',
      'focus-visible:ring-accent',
    ),
    ghost: cn(
      'bg-transparent px-0',
      'focus-visible:ring-accent',
    ),
  };

  // Ghost variant gets special treatment — no padding, arrow appended
  const isGhost = variant === 'ghost';

  return (
    <Tag
      className={cn(base, sizes[size], variants[variant], className)}
      style={
        variant === 'secondary'
          ? { borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }
          : variant === 'ghost'
            ? { color: 'var(--color-accent)' }
            : undefined
      }
      {...props}
    >
      {children}
      {isGhost && (
        <span
          className="transition-transform duration-fast group-hover:translate-x-1"
          aria-hidden="true"
        >
          →
        </span>
      )}
    </Tag>
  );
}