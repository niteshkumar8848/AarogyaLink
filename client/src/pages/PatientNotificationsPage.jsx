import AppShell from '../components/common/AppShell';
import useNotifications from '../hooks/useNotifications';
import { formatDate } from '../utils/formatDate';

const PatientNotificationsPage = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <AppShell title="Notifications">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-teal-700">Unread: {unreadCount}</p>
        <button onClick={markAllRead} className="rounded-lg bg-teal-600 px-3 py-1 text-sm text-white">Mark all read</button>
      </div>
      <div className="space-y-2">
        {notifications.map((notification) => (
          <article key={notification._id} className="rounded-xl bg-white p-3 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{notification.message}</p>
                <p className="text-xs text-gray-500">{formatDate(notification.createdAt)}</p>
              </div>
              {!notification.isRead ? (
                <button onClick={() => markRead(notification._id)} className="rounded bg-teal-100 px-2 py-1 text-xs text-teal-700">Read</button>
              ) : <span className="text-xs text-gray-400">Read</span>}
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
};

export default PatientNotificationsPage;
