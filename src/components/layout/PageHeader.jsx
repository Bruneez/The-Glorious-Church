import { useLocation } from 'react-router-dom';
import { getPageTitle } from '@/config/navConfig';

export default function PageHeader() {
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <header className="hidden h-[4.5rem] min-w-0 shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 sm:px-5 xl:flex xl:row-start-1 xl:col-start-2 xl:pl-7 xl:px-7">
      <h2 className="min-w-0 flex-1 truncate text-sm font-bold tracking-wide text-white xl:text-base">
        {title}
      </h2>
    </header>
  );
}
