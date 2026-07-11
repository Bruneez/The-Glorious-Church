import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleLabel } from '@/config/roles';
import UserAvatar from '@/components/ui/UserAvatar';
import AccountSettingsModal from '@/pages/profile/AccountSettingsModal';

export default function ProfileMenu({ className = '', compact = false }) {
  const { firebaseUser, staffProfile, role, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef(null);

  const displayName = staffProfile?.name || 'Staff Member';
  const email = firebaseUser?.email || 'loading session...';
  const photo = staffProfile?.photo;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  function handleSignOut() {
    setIsOpen(false);
    if (window.confirm('Are you sure you want to log out and terminate this session?')) {
      signOut();
    }
  }

  function handleOpenSettings() {
    setIsOpen(false);
    setShowSettings(true);
  }

  return (
    <>
      <div ref={containerRef} className={`relative ${className}`}>
        {isOpen ? (
          <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-slate-700 bg-slate-800 p-3 text-xs text-slate-300 shadow-xl space-y-2">
            <div className="border-b border-slate-700/60 pb-2 mb-1">
              <p className="font-bold text-white truncate text-[11px]">{displayName}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{email}</p>
            </div>
            <button
              type="button"
              onClick={handleOpenSettings}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition cursor-pointer font-medium"
            >
              <Settings className="w-3.5 h-3.5" />
              Account Settings
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-lg p-1.5 text-left transition hover:bg-slate-800/80 cursor-pointer"
        >
          <UserAvatar name={displayName} photo={photo} size="sm" />
          {!compact ? (
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium text-slate-200">{displayName}</p>
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-indigo-400">
                {role ? getRoleLabel(role) : 'Staff'}
              </p>
            </div>
          ) : null}
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-500 transition ${isOpen ? 'rotate-180' : ''} ${compact ? '' : 'hidden sm:block'}`}
          />
        </button>
      </div>

      <AccountSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
