import { Outlet } from 'react-router-dom';
import MobileHeader, { SidebarBackdrop, useMobileMenu } from './MobileHeader';
import Sidebar from './Sidebar';
import SidebarBrand from './SidebarBrand';
import PageHeader from './PageHeader';
import { useStaffLastSeen } from '@/hooks/useStaffLastSeen';

export default function AppLayout() {
  const mobileMenu = useMobileMenu();

  useStaffLastSeen();

  return (
    <div className="bg-slate-900 text-slate-100 font-sans h-screen flex flex-col overflow-hidden">
      <SidebarBackdrop isOpen={mobileMenu.isOpen} onClose={mobileMenu.close} />
      <MobileHeader isMenuOpen={mobileMenu.isOpen} onMenuToggle={mobileMenu.toggle} />

      <div className="flex flex-1 min-h-0 flex-col md:grid md:grid-cols-[16rem_1fr] md:grid-rows-[4rem_minmax(0,1fr)] overflow-hidden">
        <SidebarBrand className="hidden md:flex border-r border-slate-800 md:row-start-1 md:col-start-1" />
        <PageHeader />

        <Sidebar isMobileOpen={mobileMenu.isOpen} onCloseMobile={mobileMenu.close} />

        <main className="min-h-0 min-w-0 overflow-y-auto flex-1 md:row-start-2 md:col-start-2 p-4 md:p-6 w-full max-w-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
