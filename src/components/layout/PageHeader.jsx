import { useLocation } from 'react-router-dom';
import { PAGE_TITLES } from '@/config/navConfig';
import ProfileMenu from '@/components/layout/ProfileMenu';
import NotificationBell from '@/components/layout/NotificationBell';

export default function PageHeader() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'The Glorious Church';

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 hidden md:flex justify-between items-center gap-4 shrink-0 md:row-start-1 md:col-start-2 min-w-0">
      <h2 className="text-base font-bold text-white tracking-wide truncate">{title}</h2>
      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell />
        <ProfileMenu />
      </div>
    </header>
  );
}
