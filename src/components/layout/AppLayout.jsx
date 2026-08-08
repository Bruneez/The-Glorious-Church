import { Outlet, useLocation } from 'react-router-dom';
import SidebarBackdrop from './SidebarBackdrop';
import Sidebar from './Sidebar';
import SidebarBrand from './SidebarBrand';
import PageHeader from './PageHeader';
import { useStaffLastSeen } from '@/hooks/useStaffLastSeen';
import { useMobileMenu } from '@/hooks/useMobileMenu';

export default function AppLayout() {
  const mobileMenu = useMobileMenu();
  const { pathname } = useLocation();
  const isMapPage = pathname === '/map';

  useStaffLastSeen();

  return (
    <div className="bg-slate-900 text-slate-100 font-sans h-screen flex flex-col overflow-hidden">
      <SidebarBrand
        isMenuOpen={mobileMenu.isOpen}
        onMenuToggle={mobileMenu.toggle}
        menuButtonRef={mobileMenu.menuButtonRef}
      />
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
