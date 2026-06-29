import { useEffect, useRef, useState } from 'react';
import { ChevronUp, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AccountSettingsModal from '@/pages/profile/AccountSettingsModal';

export default function ProfileMenu() {
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
      <div ref={containerRef} className="p-4 border-t border-slate-800 text-xs relative">
        {isOpen ? (
          <div className="absolute left-4 bottom-16 w-60 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl space-y-2 z-50 text-xs text-slate-300">
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
          className="w-full flex items-center justify-between p-1 rounded-lg hover:bg-slate-900 text-left cursor-pointer transition"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-7 h-7 rounded-full bg-indigo-600 border border-indigo-400/30 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0 overflow-hidden">
              {photo ? (
                <img src={photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{(displayName || 'S').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="truncate">
              <p className="font-medium text-slate-200">{displayName}</p>
              <p className="text-[10px] text-indigo-400 uppercase tracking-wider">{role || 'Staff'}</p>
            </div>
          </div>
          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
        </button>
      </div>

      <AccountSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
