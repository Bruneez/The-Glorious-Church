import { useLocation } from 'react-router-dom';
import { PAGE_TITLES } from '@/config/navConfig';

export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Module';

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/70 shadow-sm space-y-2">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <p className="text-xs text-slate-400">
        This module is scheduled for a future migration phase. Navigation and access controls are active.
      </p>
    </div>
  );
}
