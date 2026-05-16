// frontend/src/pages/Notifications.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const NotificationIcon = ({ type }) => {
  const icons = {
    normal: '💬',
    alert: '⚠️',
    urgent: '🚨',
    announcement: '📢',
  };
  return <span className="text-xl">{icons[type] || '💬'}</span>;
};

const TimeAgo = ({ date }) => {
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return <span className="text-xs text-gray-500">{getTimeAgo(date)}</span>;
};

// Beautiful Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Decorative gradient bar */}
        <div className={`h-1 ${type === 'delete' ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`} />
        
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                type === 'delete' ? 'bg-red-100' : 'bg-emerald-100'
              }`}
            >
              {type === 'delete' ? (
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </motion.div>
          </div>

          {/* Title and Message */}
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-center mb-6">{message}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-white font-medium rounded-xl transition-colors ${
                type === 'delete'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
              }`}
            >
              Confirm
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

function NotificationCard({ notification, onMarkRead, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(notification.id);
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        layout
        onClick={handleClick}
        className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 group ${
          notification.is_read
            ? 'bg-white border-gray-200 hover:border-gray-300'
            : 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 shadow-md'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <NotificationIcon type={notification.type} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                {notification.type && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    notification.type === 'urgent' ? 'bg-red-100 text-red-700' :
                    notification.type === 'alert' ? 'bg-yellow-100 text-yellow-700' :
                    notification.type === 'announcement' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </span>
                )}
                {!notification.is_read && (
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                )}
              </div>
              <TimeAgo date={notification.created_at} />
            </div>
            
            <p className={`text-sm leading-relaxed ${
              notification.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'
            }`}>
              {notification.content}
            </p>
            
            {notification.sender_email && (
              <p className="text-xs text-gray-400 mt-2">
                From: {notification.sender_email}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            disabled={isDeleting}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        type="delete"
      />
    </>
  );
}

export default function Notifications() {
  const { user } = useAuth();
  const {
    notifications,
    loading,
    error,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();
  
  const [filter, setFilter] = useState('all'); // all, unread, urgent
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'urgent') return n.type === 'urgent';
    return true;
  });

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    await markAllAsRead();
    setActionLoading(false);
  };

  const handleDeleteAll = async () => {
    setActionLoading(true);
    await deleteAllNotifications();
    setActionLoading(false);
    setShowDeleteAllModal(false);
  };

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-gray-600 mt-1">
                Stay updated with your activity
              </p>
            </div>
            
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllRead}
                disabled={actionLoading || notifications.every(n => n.is_read)}
                className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Mark All Read
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteAllModal(true)}
                disabled={actionLoading || notifications.length === 0}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Delete All
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'urgent', label: 'Urgent' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f.value
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications List */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && filteredNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-6">🔔</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter !== 'all' 
                ? 'No notifications match your filter.' 
                : 'You\'re all caught up!'}
            </p>
          </motion.div>
        )}

        {/* Load More */}
        {hasMore && filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                'Load More'
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Delete All Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAll}
        title="Delete All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        type="delete"
      />
    </div>
  );
}