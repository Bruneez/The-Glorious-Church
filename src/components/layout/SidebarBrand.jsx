import { X } from 'lucide-react';
import churchLogo from '@/assets/The GC Official Logo.png';

export default function SidebarBrand({
  onCloseMobile,
  showCloseButton = false,
  className = '',
}) {
  return (
    <div
      className={`h-16 px-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0 ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <img
          src={churchLogo}
          alt="Glorious Church Logo"
          className="w-10 h-10 object-contain shrink-0"
        />
        <h1 className="text-sm font-bold tracking-wide uppercase text-indigo-300 truncate">
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
