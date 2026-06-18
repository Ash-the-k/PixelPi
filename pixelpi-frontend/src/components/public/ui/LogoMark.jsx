import { cn } from '../../../utils/cn';
import { Link, useLocation } from 'react-router-dom';
import { ScrollToTop } from '../layout/ScrollToTop';

export function LogoMark({ size = 'md' }) {
  const sizes = {
    sm: { box: 'w-5 h-5', label: 'text-[13px]' },
    md: { box: 'w-6 h-6', label: 'text-body-md' },    // 24px icon, 15px wordmark
    lg: { box: 'w-8 h-8', label: 'text-[18px]' },   // footer / large contexts
    ph: { box: 'w-8 h-8', label: 'text-[20px]' },
    nav: { box: 'w-9 h-9', label: 'text-[20px]' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <Link
      to="/"
      onClick={() => {
        if (location.pathname === '/') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      }}
      className="mr-1 flex-shrink-0 flex items-center"
      style={{ textDecoration: 'none' }}
      aria-label="Pixel Pi Technologies — home"
    >
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
            'inline-flex items-center gap-[1px]',
            s.label,
          )}
        >
          <span style={{ color: 'var(--color-text-primary)' }}>Pixel</span>
          <span style={{ color: 'var(--color-accent-hover)' }}>Pi</span>
        </span>
      </div>
    </Link>
  );
}