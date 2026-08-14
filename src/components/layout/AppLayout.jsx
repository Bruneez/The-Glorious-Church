import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarBackdrop from './SidebarBackdrop';
import Sidebar from './Sidebar';
import SidebarBrand from './SidebarBrand';
import PageHeader from './PageHeader';
import StaffProfileErrorBanner from './StaffProfileErrorBanner';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';
import { useStaffLastSeen } from '@/hooks/useStaffLastSeen';
import { useMobileMenu } from '@/hooks/useMobileMenu';
import { useAuth } from '@/hooks/useAuth';

function getSectionModuleName(pathname) {
  const segment = pathname.split('/').filter(Boolean)[0] || 'page';
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function AppLayout() {
  const mobileMenu = useMobileMenu();
  const { pathname } = useLocation();
  const isMapPage = pathname === '/map';
  const {
    staffProfileError,
    refreshStaffProfile,
    isStaffSessionLoading,
  } = useAuth();
  const [dismissedProfileError, setDismissedProfileError] = useState(null);

  useStaffLastSeen();

  useEffect(() => {
    setDismissedProfileError(null);
  }, [staffProfileError]);

  const showStaffProfileBanner =
    Boolean(staffProfileError) && dismissedProfileError !== staffProfileError;

  return (
    <div className="bg-slate-900 text-slate-100 font-sans h-screen flex flex-col overflow-hidden">
      <SidebarBrand
        isMenuOpen={mobileMenu.isOpen}
        onMenuToggle={mobileMenu.toggle}
        menuButtonRef={mobileMenu.menuButtonRef}
      />
      {showStaffProfileBanner ? (
        <StaffProfileErrorBanner
          message={staffProfileError}
          onRetry={refreshStaffProfile}
          isRetrying={isStaffSessionLoading}
          onDismiss={() => setDismissedProfileError(staffProfileError)}
        />
      ) : null}
      <SidebarBackdrop isOpen={mobileMenu.isOpen} onClose={mobileMenu.close} />

      <div
        className={`flex flex-1 min-h-0 flex-col overflow-hidden xl:grid xl:grid-cols-[17.5rem_1fr] ${
          isMapPage ? 'xl:grid-rows-[minmax(0,1fr)]' : 'xl:grid-rows-[4.5rem_minmax(0,1fr)]'
        }`}
      >
        {!isMapPage ? <PageHeader /> : null}

        <Sidebar
          isMobileOpen={mobileMenu.isOpen}
          onCloseMobile={mobileMenu.close}
          drawerRef={mobileMenu.drawerRef}
          labelId={mobileMenu.labelId}
          fullHeight={isMapPage}
        />

        <main
          className={`min-h-0 min-w-0 w-full max-w-none flex-1 xl:col-start-2 ${
            isMapPage
              ? 'h-full overflow-hidden p-0 xl:row-start-1'
              : 'overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-5 xl:row-start-2 xl:px-7 xl:py-6 2xl:px-8'
          }`}
        >
          <SectionErrorBoundary
            key={pathname}
            moduleName={getSectionModuleName(pathname)}
            fallbackPath="/dashboard"
          >
            <Outlet />
          </SectionErrorBoundary>
        </main>
      </div>
    </div>
  );
}
