import { useLocation } from 'react-router-dom';
import { PAGE_TITLES } from '@/config/navConfig';

export default function PageHeader() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'The Glorious Church';

  return (
    <header className="hidden h-[4.5rem] min-w-0 shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 sm:px-5 lg:flex lg:row-start-1 lg:col-start-2 lg:pl-7 lg:px-7">
      <h2 className="min-w-0 flex-1 truncate text-sm font-bold tracking-wide text-white lg:text-base">
        {title}
      </h2>
    </header>
  );
}
