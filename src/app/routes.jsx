import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import GuestRoute from '@/components/auth/GuestRoute';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import MembersPage from '@/pages/MembersPage';
import CreativeArtsPage from '@/pages/CreativeArtsPage';
import PrimarySchoolsPage from '@/pages/PrimarySchoolsPage';
import HighSchoolsPage from '@/pages/HighSchoolsPage';
import HigherEducationPage from '@/pages/HigherEducationPage';
import SchoolsPage from '@/pages/SchoolsPage';
import AttendancePage from '@/pages/AttendancePage';
import OfferingsPage from '@/pages/OfferingsPage';
import TransportPage from '@/pages/TransportPage';
import CalendarPage from '@/pages/CalendarPage';
import UsersPage from '@/pages/UsersPage';
import ProfileSettingsPage from '@/pages/ProfileSettingsPage';
import MembersMapPage from '@/pages/MembersMapPage';
import HighSchoolsMapPage from '@/pages/HighSchoolsMapPage';
import DevelopmentBoardPage from '@/pages/DevelopmentBoardPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="system-users" element={<Navigate to="/users" replace />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="creative-arts" element={<CreativeArtsPage />} />
          <Route path="schools" element={<SchoolsPage />} />
          <Route path="schools/primary" element={<PrimarySchoolsPage />} />
          <Route path="schools/high" element={<HighSchoolsPage />} />
          <Route path="schools/higher-education" element={<HigherEducationPage />} />
          <Route path="maps/members" element={<MembersMapPage />} />
          <Route path="maps/schools" element={<HighSchoolsMapPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="offerings" element={<OfferingsPage />} />
          <Route path="transport" element={<TransportPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="development-board" element={<DevelopmentBoardPage />} />
          <Route path="profile" element={<ProfileSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
