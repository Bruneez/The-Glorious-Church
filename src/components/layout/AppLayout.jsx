import { Outlet } from 'react-router-dom';
import SidebarBackdrop from './SidebarBackdrop';
import Sidebar from './Sidebar';
import SidebarBrand from './SidebarBrand';
import PageHeader from './PageHeader';
import { useStaffLastSeen } from '@/hooks/useStaffLastSeen';
import { useMobileMenu } from '@/hooks/useMobileMenu';

export default function AppLayout() {
  const mobileMenu = useMobileMenu();

  useStaffLastSeen();

  return (
    <div className="bg-slate-900 text-slate-100 font-sans h-screen flex flex-col overflow-hidden">
      <SidebarBrand
        isMenuOpen={mobileMenu.isOpen}
        onMenuToggle={mobileMenu.toggle}
        menuButtonRef={mobileMenu.menuButtonRef}
      />
      <SidebarBackdrop isOpen={mobileMenu.isOpen} onClose={mobileMenu.close} />

      <div className="flex flex-1 min-h-0 flex-col xl:grid xl:grid-cols-[17.5rem_1fr] xl:grid-rows-[4.5rem_minmax(0,1fr)] overflow-hidden">
        <PageHeader />

        <Sidebar
          isMobileOpen={mobileMenu.isOpen}
          onCloseMobile={mobileMenu.close}
          drawerRef={mobileMenu.drawerRef}
          labelId={mobileMenu.labelId}
        />

        <main className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden flex-1 xl:row-start-2 xl:col-start-2 px-4 py-4 sm:px-5 xl:px-7 xl:py-6 2xl:px-8 w-full max-w-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
