import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, token } = useAuthStore();
  const openAuth = useUIStore((s) => s.openAuth);
  const location = useLocation();

  useEffect(() => {
    if (!token && !isAuthenticated) {
      openAuth('login');
    }
  }, [token, isAuthenticated, openAuth]);

  // While we still have a token but haven't verified the user yet, wait.
  if (token && !isAuthenticated && isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-500">
        Loading…
      </div>
    );
  }

  if (!token && !isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
