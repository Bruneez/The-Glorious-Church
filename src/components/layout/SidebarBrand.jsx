import { X } from 'lucide-react';
import churchLogo from '@/assets/The GC Official Logo.png';

export default function SidebarBrand({
  onCloseMobile,
  showCloseButton = false,
  className = '',
}) {
  return (
    <div
      className={`h-[4.5rem] px-5 md:px-7 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0 ${className}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img
          src={churchLogo}
          alt="Glorious Church Logo"
          className="w-11 h-11 object-contain shrink-0"
        />
        <h1 className="min-w-0 text-xs md:text-[0.8125rem] font-bold tracking-wide uppercase text-indigo-300 truncate leading-tight">
          The Glorious Church
        </h1>
      </div>

      {showCloseButton && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden text-slate-400 hover:text-white cursor-pointer shrink-0"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
