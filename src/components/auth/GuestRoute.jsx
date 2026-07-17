import { Navigate, Outlet } from 'react-router-dom';
import SplashScreen from '@/components/ui/SplashScreen';
import { useAuth } from '@/hooks/useAuth';

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  let content = null;

  if (!isLoading) {
    content = isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
  }

  return (
    <>
      {content}
      <SplashScreen active={isLoading} />
    </>
  );
}
