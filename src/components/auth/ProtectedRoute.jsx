import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import SplashScreen from '@/components/ui/SplashScreen';
import { useAuth } from '@/hooks/useAuth';
import { canAccessRoute } from '@/config/permissions';
import {
  AUTH_STATUS,
  canEvaluateRouteAccess,
  shouldRedirectToLogin,
} from '@/utils/authSessionState';
import { logStability } from '@/utils/stabilityDebug';

export default function ProtectedRoute() {
  const {
    firebaseUser,
    isLoading,
    isStaffSessionLoading,
    authStatus,
    role,
  } = useAuth();
  const location = useLocation();

  const redirectToLogin = shouldRedirectToLogin({ isLoading, firebaseUser });
  const routeAccessReady = canEvaluateRouteAccess({ isStaffSessionLoading, role });
  const denyRouteAccess =
    routeAccessReady && authStatus === AUTH_STATUS.AUTHENTICATED && !canAccessRoute(role, location.pathname);

  useEffect(() => {
    if (!redirectToLogin) return;

    logStability('route.auth.redirect_login', {
      pathname: location.pathname,
      authStatus,
    });
  }, [redirectToLogin, location.pathname, authStatus]);

  if (redirectToLogin) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  if (authStatus === AUTH_STATUS.LOADING) {
    return <SplashScreen active />;
  }

  if (denyRouteAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Outlet />
      <SplashScreen active={isStaffSessionLoading && !routeAccessReady} />
    </>
  );
}
