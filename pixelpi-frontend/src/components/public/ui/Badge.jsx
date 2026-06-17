import { cn } from '../../../utils/cn';

const BADGE_STYLES = {
  default: {
    background: 'rgba(240, 242, 248, 0.10)',
    color: 'rgba(240, 242, 248, 0.60)',
  },
  success: {
    background: 'rgba(34, 197, 94, 0.12)',
    color: '#16A34A',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.12)',
    color: '#B45309',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#DC2626',
  },
  info: {
    background: 'rgba(56, 189, 248, 0.12)',
    color: '#0EA5E9',
  },
  accent: {
    background: 'rgba(79, 107, 204, 0.12)',
    color: '#4F6BCC',
  },
};

export function Badge({ children, variant = 'default', className }) {
  const style = BADGE_STYLES[variant] || BADGE_STYLES.default;

  return (
    <span
      className={cn(
        'inline-flex items-center',
        'font-mono text-mono-sm uppercase tracking-wider',
        'px-2 py-0.5 rounded-sm',
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}