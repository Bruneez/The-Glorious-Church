import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ComingSoonPage from '@/pages/ComingSoonPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<ComingSoonPage />} />
          <Route path="members" element={<ComingSoonPage />} />
          <Route path="creative-arts" element={<ComingSoonPage />} />
          <Route path="schools/primary" element={<ComingSoonPage />} />
          <Route path="schools/high" element={<ComingSoonPage />} />
          <Route path="schools/higher-education" element={<ComingSoonPage />} />
          <Route path="maps/members" element={<ComingSoonPage />} />
          <Route path="maps/schools" element={<ComingSoonPage />} />
          <Route path="attendance" element={<ComingSoonPage />} />
          <Route path="offerings" element={<ComingSoonPage />} />
          <Route path="transport" element={<ComingSoonPage />} />
          <Route path="calendar" element={<ComingSoonPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
