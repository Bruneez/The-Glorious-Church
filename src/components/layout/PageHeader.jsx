import { useLocation } from 'react-router-dom';
import { PAGE_TITLES } from '@/config/navConfig';

export default function PageHeader({ badge = 'The Greatest Service' }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'The Glorious Church';

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 hidden md:flex justify-between items-center shrink-0">
      <h2 className="text-base font-bold text-white tracking-wide">{title}</h2>
      <div className="text-[11px] text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded font-medium border border-indigo-500/20">
        {badge}
      </div>
    </header>
  );
}
