import { Menu } from 'lucide-react';
import churchLogo from '@/assets/tgc-logo-trimmed.png';
import ProfileMenu from '@/components/layout/ProfileMenu';
import NotificationBell from '@/components/layout/NotificationBell';
import { NAV_DRAWER_ID } from '@/hooks/useMobileMenu';

const MOBILE_HEADER_HEIGHT =
  'h-[calc(4.5rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)]';

export default function SidebarBrand({
  isMenuOpen,
  onMenuToggle,
  menuButtonRef,
}) {
  return (
    <header
      className={`flex ${MOBILE_HEADER_HEIGHT} shrink-0 items-center gap-2 overflow-visible border-b border-slate-800 bg-slate-950 px-3 sm:gap-3 sm:px-5 xl:gap-3 xl:px-7 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:pl-[max(1.25rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.25rem,env(safe-area-inset-right,0px))] z-[60]`}
    >
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onMenuToggle}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer xl:hidden"
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMenuOpen}
        aria-controls={NAV_DRAWER_ID}
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden xl:justify-start">
        <div className="flex min-w-0 max-w-full items-center gap-2 xl:gap-3">
          <img
            src={churchLogo}
            alt="Glorious Church Logo"
            className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8 xl:h-9 xl:w-9"
          />
          <h1 className="min-w-0 truncate whitespace-nowrap text-xs font-bold uppercase leading-tight tracking-wide text-indigo-300 xl:text-[0.8125rem]">
            The Glorious Church
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 overflow-visible sm:gap-3 xl:gap-2.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-visible xl:h-auto xl:w-auto">
          <NotificationBell />
        </div>
        <div className="flex h-11 shrink-0 items-center xl:h-auto">
          <div className="xl:hidden">
            <ProfileMenu compact />
          </div>
          <div className="hidden xl:block">
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
