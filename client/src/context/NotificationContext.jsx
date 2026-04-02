import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocketContext } from './SocketContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocketContext();
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      const { data } = await notificationAPI.list();
      setNotifications(data.notifications);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const onNew = (payload) => {
      if (!user || String(payload.userId) !== String(user._id)) return;
      setNotifications((prev) => [
        {
          _id: `rt-${Date.now()}`,
          message: payload.message,
          type: payload.type,
          isRead: false,
          createdAt: payload.createdAt || new Date().toISOString()
        },
        ...prev
      ]);
    };

    socket.on('notification:new', onNew);
    return () => socket.off('notification:new', onNew);
  }, [socket, user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const value = useMemo(
    () => ({ notifications, unreadCount, reloadNotifications: loadNotifications, markRead, markAllRead }),
    [notifications, unreadCount]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationContext must be used within NotificationProvider');
  return context;
};
