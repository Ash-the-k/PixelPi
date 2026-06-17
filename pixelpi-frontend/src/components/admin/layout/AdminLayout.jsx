import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh' }}>
      {/* Sidebar + Topbar go here — Week 3 */}
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}