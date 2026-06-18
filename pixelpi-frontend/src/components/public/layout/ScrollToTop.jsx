import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Restores scroll position to the top on every route change.
// Uses 'instant' — smooth scroll is reserved for the logo click-to-top
// behavior on the home page (handled inside LogoMark).
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}