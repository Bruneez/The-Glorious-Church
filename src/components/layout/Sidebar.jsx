import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getNavItemsForRole } from '@/config/navConfig';
import { NAV_DRAWER_ID, useIsDesktopSidebar } from '@/hooks/useMobileMenu';

function navLinkClass({ isActive }) {
  return isActive
    ? 'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white bg-indigo-600 font-semibold shadow-sm shadow-indigo-900/40 ring-1 ring-indigo-400/25 transition'
    : 'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800/60 hover:text-white font-medium transition';
}

export default function Sidebar({
  isMobileOpen,
  onCloseMobile,
  drawerRef,
  labelId,
  fullHeight = false,
}) {
  const { role } = useAuth();
  const navItems = getNavItemsForRole(role);
  const isDesktopSidebar = useIsDesktopSidebar();
  const isOverlayDrawerClosed = !isDesktopSidebar && !isMobileOpen;

  return (
    <aside
      ref={drawerRef}
      id={NAV_DRAWER_ID}
      aria-labelledby={labelId}
      aria-hidden={isOverlayDrawerClosed ? true : undefined}
      inert={isOverlayDrawerClosed ? true : undefined}
      className={`nav-drawer fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] bottom-0 left-0 z-50 flex w-[min(82vw,20rem)] max-w-[320px] flex-col border-r border-slate-800 bg-slate-950 pl-[env(safe-area-inset-left,0px)] transition-transform duration-300 ease-in-out sm:w-[min(40vw,21.25rem)] sm:max-w-[340px] xl:static xl:inset-auto xl:z-auto xl:top-auto xl:h-full xl:w-[17.5rem] xl:max-w-none xl:translate-x-0 xl:row-start-1 ${fullHeight ? 'xl:row-span-1' : 'xl:row-span-2'} xl:col-start-1 xl:pl-0 shrink-0 min-h-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full max-xl:invisible max-xl:pointer-events-none'
      }`}
    >
      <h2 id={labelId} className="sr-only">
        Main navigation
      </h2>

      <div className="flex shrink-0 items-center justify-end border-b border-slate-800 px-3 py-2 xl:hidden">
        <button
          type="button"
          data-nav-drawer-close
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden p-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]"
        aria-label="Module navigation"
      >
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={navLinkClass}
            onClick={onCloseMobile}
          >
            <Icon className="w-[1.125rem] h-[1.125rem] shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
