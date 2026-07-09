import { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeTime } from '@/utils/formatters';
import {
  NOTIFICATION_LIMIT,
  NOTIFICATION_TYPE,
  NOTIFICATION_TYPE_META,
} from '@/config/notificationOptions';
import {
  getNotificationDescription,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useNotifications,
} from '@/services/notificationService';

function NotificationIcon({ type }) {
  const meta = NOTIFICATION_TYPE_META[type] || NOTIFICATION_TYPE_META[NOTIFICATION_TYPE.TASK_ASSIGNED];
  const Icon = meta.icon;

  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
      <Icon className={`h-4 w-4 ${meta.accent}`} />
    </div>
  );
}

export default function NotificationBell({ className = '' }) {
  const { staffDocId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { notifications, allNotifications, unreadCount, loading } = useNotifications(staffDocId);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  async function handleNotificationClick(notification) {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }
  }

  async function handleMarkAllAsRead() {
    await markAllNotificationsAsRead(staffDocId, allNotifications);
  }

  if (!staffDocId) return null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-slate-400 transition hover:bg-slate-800/80 hover:text-white cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Notifications</p>
              <p className="text-[10px] text-slate-400">Latest {NOTIFICATION_LIMIT} updates</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-medium text-indigo-400 transition hover:text-indigo-300 cursor-pointer"
                >
                  Mark all as read
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-700/80 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-slate-700/60">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-700/40 cursor-pointer ${
                        notification.isRead ? 'opacity-80' : 'bg-indigo-500/5'
                      }`}
                    >
                      <NotificationIcon type={notification.type} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-white">{notification.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
                          {getNotificationDescription(notification)}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead ? (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
