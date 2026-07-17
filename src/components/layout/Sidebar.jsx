import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getNavItemsForRole } from '@/config/navConfig';
import { NAV_DRAWER_ID } from '@/hooks/useMobileMenu';

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
}) {
  const { role } = useAuth();
  const navItems = getNavItemsForRole(role);

  return (
    <aside
      ref={drawerRef}
      id={NAV_DRAWER_ID}
      aria-labelledby={labelId}
      className={`fixed top-[9rem] bottom-0 left-0 z-50 flex w-[min(82vw,20rem)] max-w-[320px] flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 ease-in-out sm:w-[min(40vw,21.25rem)] sm:max-w-[340px] lg:static lg:inset-auto lg:z-auto lg:top-auto lg:h-full lg:w-[17.5rem] lg:max-w-none lg:translate-x-0 lg:row-start-1 lg:row-span-2 lg:col-start-1 shrink-0 min-h-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <h2 id={labelId} className="sr-only">
        Main navigation
      </h2>

      <nav
        className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden p-5"
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
