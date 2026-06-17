import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

// Pages where we want the hero to visually extend behind the navbar
// (full-screen hero sections). All other pages get standard padding-top.
const HERO_PAGES = ['/', '/about', '/projects', '/blog', '/careers', '/contact'];

export function PublicLayout() {
  const location = useLocation();
  const isHeroPage = HERO_PAGES.includes(location.pathname) ||
                     location.pathname.startsWith('/blog/');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/*
        padding-top accounts for the fixed navbar:
        20px (top offset) + 52px (pill height) + 24px (breathing room) = 96px.
        Hero sections override this with their own full-height treatment.
        For now all pages get the padding — it's overridden per-section where needed.
      */}
      <main className="flex-1" style={{ paddingTop: '96px' }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}