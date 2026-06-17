import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';

export function PublicLayout() {
  return (
    <div>
      {/* Navbar goes here — Day 3 */}
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}