import { Navigate, Outlet, useLocation } from 'react-router-dom';
import SplashScreen from '@/components/ui/SplashScreen';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_STATUS, resolvePostLoginPath } from '@/utils/authSessionState';

export default function GuestRoute() {
  const { authStatus } = useAuth();
  const location = useLocation();

  if (authStatus === AUTH_STATUS.LOADING) {
    return <SplashScreen active />;
  }

  if (authStatus === AUTH_STATUS.AUTHENTICATED) {
    return (
      <Navigate
        to={resolvePostLoginPath(location.state?.from)}
        replace
      />
    );
  }

  return <Outlet />;
}
