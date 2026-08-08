import { Navigate, Outlet, useLocation } from 'react-router-dom';
import SplashScreen from '@/components/ui/SplashScreen';
import { useAuth } from '@/hooks/useAuth';
import { canAccessRoute } from '@/config/permissions';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, isStaffSessionLoading, role } = useAuth();
  const location = useLocation();
  const isSessionReady = !isLoading && (!isAuthenticated || !isStaffSessionLoading);

  let content = null;

  if (isSessionReady) {
    if (!isAuthenticated) {
      content = <Navigate to="/login" replace state={{ from: location.pathname }} />;
    } else if (!canAccessRoute(role, location.pathname)) {
      content = <Navigate to="/dashboard" replace />;
    } else {
      content = <Outlet />;
    }
  }

  return (
    <>
      {content}
      <SplashScreen active={!isSessionReady} />
    </>
  );
}
