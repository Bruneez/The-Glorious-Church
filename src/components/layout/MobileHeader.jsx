import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import churchLogo from '@/assets/The GC Official Logo.png';
import ProfileMenu from '@/components/layout/ProfileMenu';
import NotificationBell from '@/components/layout/NotificationBell';

export default function MobileHeader({ onMenuToggle, isMenuOpen }) {
  return (
    <div className="md:hidden h-16 px-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center gap-3 z-50 sticky top-0 shrink-0">
      <div className="flex min-w-0 items-center gap-2">
        <img src={churchLogo} alt="Glorious Church Logo" className="w-8 h-8 object-contain shrink-0" />
        <h1 className="text-xs font-bold tracking-wide uppercase text-indigo-300 truncate">The Glorious Church</h1>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <NotificationBell />
        <ProfileMenu compact />
        <button
          type="button"
          onClick={onMenuToggle}
          className="text-slate-400 hover:text-white focus:outline-none cursor-pointer p-1"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}

export function SidebarBackdrop({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-30 md:hidden"
      onClick={onClose}
      role="presentation"
    />
  );
}

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
