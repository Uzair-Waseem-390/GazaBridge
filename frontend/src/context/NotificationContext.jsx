// frontend/src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationsAPI } from '../api/notifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pollingRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await notificationsAPI.getNotifications(user.id, {
        page: pageNum,
        page_size: 20,
      });

      const newNotifications = response.data.results || response.data;
      const totalPages = response.data.total_pages || 1;

      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initial fetch and polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      fetchNotifications(1, false);

      // Poll for new notifications every 30 seconds
      pollingRef.current = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(true);
      setPage(1);
    }
  }, [isAuthenticated, fetchUnreadCount, fetchNotifications]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, true);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setUnreadCount(0);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to mark all as read' };
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!user) return { success: false };

    try {
      await notificationsAPI.deleteNotification(user.id, notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      const deletedNotif = notifications.find(n => n.id === notificationId);
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to delete notification' };
    }
  };

  const deleteAllNotifications = async () => {
    if (!user) return { success: false };

    try {
      await notificationsAPI.deleteAllNotifications(user.id);
      setNotifications([]);
      setUnreadCount(0);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to delete all notifications' };
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshCount: fetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}