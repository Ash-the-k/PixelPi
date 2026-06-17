import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div>
      {/* Navbar goes here — Day 3 */}
      <main>
        <Outlet />
      </main>
      {/* Footer goes here — Day 2 */}
    </div>
  );
}