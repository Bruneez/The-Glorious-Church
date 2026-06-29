import { Outlet } from 'react-router-dom';
import MobileHeader, { SidebarBackdrop, useMobileMenu } from './MobileHeader';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';

export default function AppLayout() {
  const mobileMenu = useMobileMenu();

  return (
    <div className="bg-slate-900 text-slate-100 font-sans min-h-screen flex flex-col md:flex-row overflow-hidden">
      <SidebarBackdrop isOpen={mobileMenu.isOpen} onClose={mobileMenu.close} />
      <MobileHeader isMenuOpen={mobileMenu.isOpen} onMenuToggle={mobileMenu.toggle} />
      <Sidebar isMobileOpen={mobileMenu.isOpen} onCloseMobile={mobileMenu.close} />

      <div className="flex-1 h-screen flex flex-col overflow-hidden">
        <PageHeader />
        <main className="p-4 md:p-6 overflow-y-auto flex-1 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
