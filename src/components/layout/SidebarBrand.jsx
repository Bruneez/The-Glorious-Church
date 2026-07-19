import churchLogo from '@/assets/tgc-logo-trimmed.png';
import ProfileMenu from '@/components/layout/ProfileMenu';
import NotificationBell from '@/components/layout/NotificationBell';

export default function SidebarBrand() {
  return (
    <header className="h-[4.5rem] px-4 sm:px-5 lg:px-7 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0 z-[60]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img
          src={churchLogo}
          alt="Glorious Church Logo"
          className="h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 object-contain shrink-0"
        />
        <h1 className="min-w-0 text-xs lg:text-[0.8125rem] font-bold tracking-wide uppercase text-indigo-300 truncate leading-tight">
          The Glorious Church
        </h1>
      </div>

      <div className="flex items-center gap-1 lg:gap-2.5 shrink-0">
        <NotificationBell />
        <div className="lg:hidden">
          <ProfileMenu compact />
        </div>
        <div className="hidden lg:block">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
