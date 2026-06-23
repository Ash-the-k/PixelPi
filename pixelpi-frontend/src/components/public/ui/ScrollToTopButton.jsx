import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      style={{
        position:       'fixed',
        bottom:         '30px',
        right:          '30px',
        zIndex:         40,
        width:          '40px',
        height:         '40px',
        borderRadius:   '9999px',
        border:         'none',
        cursor:         'pointer',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        // Glass — matches navbar treatment
        background:          'rgba(13, 18, 32, 0.70)',
        backdropFilter:      'blur(3px)',
        WebkitBackdropFilter:'blur(3px)',
        boxShadow:      '0 4px 16px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.10)',
        color:          'var(--color-text-secondary)',
        // Visibility transition
        opacity:        visible ? 1 : 0,
        transform:      visible ? 'translateY(0)' : 'translateY(8px)',
        pointerEvents:  visible ? 'auto' : 'none',
        transition:     'opacity 220ms ease, transform 220ms ease, color 150ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
    >
      <ArrowUp size={16} strokeWidth={2} />
    </button>
  );
}