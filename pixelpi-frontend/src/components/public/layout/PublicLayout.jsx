import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { ScrollToTopButton } from '../ui/ScrollToTopButton';

// Pages where we want the hero to visually extend behind the navbar
// (full-screen hero sections). All other pages get standard padding-top.
const HERO_PAGES = ['/', '/about', '/projects', '/blog', '/careers', '/contact'];

export function PublicLayout() {
  const location = useLocation();
  const isHeroPage = HERO_PAGES.includes(location.pathname) ||
                     location.pathname.startsWith('/blog/');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}