import { Navigate } from 'react-router-dom';
import SplashScreen from '@/components/ui/SplashScreen';
import { useAuth } from '@/hooks/useAuth';

export default function NotFoundRedirect() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <SplashScreen active />;
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}
