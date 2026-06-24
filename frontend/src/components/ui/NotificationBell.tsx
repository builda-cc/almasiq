import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check } from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../../hooks/queries';
import { formatRelativeTime } from '../../utils/helpers';

export function NotificationBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = notifications ?? [];
  const unread = items.filter((n) => !n.is_read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-beige-600 hover:text-beige-900 rounded-lg hover:bg-beige-50"
        aria-label={t('notifications.title')}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 bg-gold-600 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-80 bg-white border border-beige-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-beige-100">
            <span className="text-sm font-semibold text-beige-900">
              {t('notifications.title')}
            </span>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700"
              >
                <Check className="w-3.5 h-3.5" />
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-beige-400">
                {t('notifications.empty')}
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.is_read && markRead.mutate(n.id)}
                  className={`w-full text-left px-3 py-2.5 border-b border-beige-50 hover:bg-beige-50 ${
                    n.is_read ? '' : 'bg-gold-50/50'
                  }`}
                >
                  <p className="text-sm font-medium text-beige-900">{n.title}</p>
                  {n.body && (
                    <p className="mt-0.5 text-xs text-beige-500 line-clamp-2">
                      {n.body}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-beige-400">
                    {formatRelativeTime(n.created_at)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
