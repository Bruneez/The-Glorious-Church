import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getNavItemsForRole } from '@/config/navConfig';
import SidebarBrand from './SidebarBrand';

function navLinkClass({ isActive }) {
  return isActive
    ? 'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white bg-indigo-600 font-semibold shadow-sm shadow-indigo-900/40 ring-1 ring-indigo-400/25 transition'
    : 'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800/60 hover:text-white font-medium transition';
}

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const { role } = useAuth();
  const navItems = getNavItemsForRole(role);

  return (
    <aside
      className={`fixed inset-y-0 left-0 transform ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } md:static md:translate-x-0 md:h-full w-64 md:w-[17.5rem] bg-slate-950 border-r border-slate-800 z-40 flex flex-col shrink-0 transition-transform duration-300 ease-in-out md:row-start-2 md:col-start-1 min-h-0`}
    >
      <div className="flex flex-col flex-1 min-h-0">
        <div className="md:hidden">
          <SidebarBrand onCloseMobile={onCloseMobile} showCloseButton />
        </div>

        <nav className="p-5 space-y-1.5 overflow-y-auto flex-1 min-h-0">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={navLinkClass}
              onClick={onCloseMobile}
            >
              <Icon className="w-[1.125rem] h-[1.125rem] shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
