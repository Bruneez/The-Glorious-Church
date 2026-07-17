import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { PAGE_TITLES } from '@/config/navConfig';
import { NAV_DRAWER_ID } from '@/hooks/useMobileMenu';

export default function PageHeader({ isMenuOpen, onMenuToggle, menuButtonRef }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'The Glorious Church';

  return (
    <header className="h-[4.5rem] bg-slate-900 border-b border-slate-800 px-4 sm:px-5 lg:px-7 flex items-center gap-3 shrink-0 min-w-0 lg:row-start-1 lg:col-start-2 lg:pl-7">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onMenuToggle}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer shrink-0 lg:hidden"
        aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isMenuOpen}
        aria-controls={NAV_DRAWER_ID}
      >
        <Menu className="w-6 h-6" aria-hidden="true" />
      </button>

      <h2 className="min-w-0 flex-1 text-sm lg:text-base font-bold text-white tracking-wide truncate">
        {title}
      </h2>
    </header>
  );
}
