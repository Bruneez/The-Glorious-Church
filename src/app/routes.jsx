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
import MapPage from '@/pages/MapPage';
import DevelopmentBoardPage from '@/pages/DevelopmentBoardPage';
import TasksPage from '@/pages/TasksPage';
import MinistriesPage from '@/pages/MinistriesPage';
import BlueprintPage from '@/pages/BlueprintPage';
import ServiceProgramPage from '@/pages/ServiceProgramPage';
import TravellingPage from '@/pages/TravellingPage';
import MachanehMoviesPage from '@/pages/MachanehMoviesPage';
import MerchandisePage from '@/pages/MerchandisePage';

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
          <Route path="blueprint" element={<BlueprintPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="system-users" element={<Navigate to="/users" replace />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="creative-arts" element={<CreativeArtsPage />} />
          <Route path="ministries" element={<MinistriesPage />} />
          <Route path="schools" element={<SchoolsPage />} />
          <Route path="schools/primary" element={<PrimarySchoolsPage />} />
          <Route path="schools/high" element={<HighSchoolsPage />} />
          <Route path="schools/higher-education" element={<HigherEducationPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="maps/members" element={<Navigate to="/map" replace />} />
          <Route path="maps/schools" element={<Navigate to="/map" replace />} />
          <Route path="members-map" element={<Navigate to="/map" replace />} />
          <Route path="high-schools-map" element={<Navigate to="/map" replace />} />
          <Route path="schools-map" element={<Navigate to="/map" replace />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="offerings" element={<OfferingsPage />} />
          <Route path="transport" element={<TransportPage />} />
          <Route path="travelling" element={<TravellingPage />} />
          <Route path="machaneh-movies" element={<MachanehMoviesPage />} />
          <Route path="merchandise" element={<MerchandisePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="service-program" element={<ServiceProgramPage />} />
          <Route path="development-board" element={<DevelopmentBoardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="profile" element={<ProfileSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
