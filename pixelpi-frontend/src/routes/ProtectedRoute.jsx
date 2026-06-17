import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function AdminLoadingScreen() {
  return (
    <div
      style={{
        background: '#080C14',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#F0F2F8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        letterSpacing: '0.05em',
      }}
    >
      Loading...
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return <AdminLoadingScreen />;
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}