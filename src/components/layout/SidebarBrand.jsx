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
      className={`flex ${MOBILE_HEADER_HEIGHT} shrink-0 items-center gap-2 overflow-visible border-b border-slate-800 bg-slate-950 px-3 sm:gap-3 sm:px-5 lg:gap-3 lg:px-7 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:pl-[max(1.25rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.25rem,env(safe-area-inset-right,0px))] z-[60]`}
    >
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onMenuToggle}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer lg:hidden"
        aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isMenuOpen}
        aria-controls={NAV_DRAWER_ID}
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden lg:justify-start">
        <div className="flex min-w-0 max-w-full items-center gap-2 lg:gap-3">
          <img
            src={churchLogo}
            alt="Glorious Church Logo"
            className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8 lg:h-9 lg:w-9"
          />
          <h1 className="min-w-0 truncate whitespace-nowrap text-xs font-bold uppercase leading-tight tracking-wide text-indigo-300 lg:text-[0.8125rem]">
            The Glorious Church
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 overflow-visible sm:gap-3 lg:gap-2.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-visible lg:h-auto lg:w-auto">
          <NotificationBell />
        </div>
        <div className="flex h-11 shrink-0 items-center lg:h-auto">
          <div className="lg:hidden">
            <ProfileMenu compact />
          </div>
          <div className="hidden lg:block">
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
