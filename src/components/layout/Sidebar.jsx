import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getNavItemsForRole } from '@/config/navConfig';
import ProfileMenu from './ProfileMenu';

function navLinkClass({ isActive }) {
  return isActive
    ? 'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white bg-indigo-600 font-medium transition'
    : 'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-white font-medium transition';
}

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const { role } = useAuth();
  const navItems = getNavItemsForRole(role);

  return (
    <aside
      className={`fixed inset-y-0 left-0 transform ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 w-64 bg-slate-950 border-r border-slate-800 h-screen z-40 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out`}
    >
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/img/GC_logo.png" alt="Glorious Church Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase text-indigo-300">The Glorious Church</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 text-xs">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={navLinkClass}
              onClick={onCloseMobile}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <ProfileMenu />
    </aside>
  );
}
