import { Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';

export function RequireAdmin() {
  const { user, isAuthenticated, isLoading, token } = useAuthStore();
  const { t } = useTranslation();

  // Wait while we still have a token but haven't verified the user yet.
  if (token && !isAuthenticated && isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-beige-500">
        {t('protectedRoute.loading')}
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
