import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import AppRoutes from '@/app/routes';
import PwaUpdatePrompt from '@/components/pwa/PwaUpdatePrompt';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <PwaUpdatePrompt />
      </AuthProvider>
    </BrowserRouter>
  );
}
