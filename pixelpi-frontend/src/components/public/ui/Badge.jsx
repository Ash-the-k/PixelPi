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

export function Badge({ variant = 'default', children }) {
  const style = BADGE_STYLES[variant] ?? BADGE_STYLES.default;
  // badge-hoverable enables the parent card-interactive hover rule in index.css
  const hoverable = variant === 'accent' || variant === 'default';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-sm font-mono text-mono-sm transition-colors duration-[175ms] ${hoverable ? 'badge-hoverable' : ''}`}
      style={{
        ...style,
        border: '1px solid transparent',
      }}
    >
      {children}
    </span>
  );
}