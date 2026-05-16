// frontend/src/pages/AdminNotifications.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { notificationsAPI } from '../api/notifications';

const TARGET_GROUPS = [
  { value: 'volunteers', label: '🧑‍🏫 Volunteers' },
  { value: 'seekers', label: '🎓 Seekers' },
  { value: 'managers', label: '👔 Managers' },
  { value: 'admins', label: '🛡️ Admins' },
  { value: 'all_users', label: '👥 All Users' },
];

const NOTIFICATION_TYPES = [
  { value: 'normal', label: '💬 Normal' },
  { value: 'alert', label: '⚠️ Alert' },
  { value: 'urgent', label: '🚨 Urgent' },
  { value: 'announcement', label: '📢 Announcement' },
];

export default function AdminNotifications() {
  const [formData, setFormData] = useState({
    content: '',
    type: 'normal',
    target_groups: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.target_groups.length === 0) {
      setError('Please select at least one target group.');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Please enter notification content.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await notificationsAPI.sendAdminNotification(formData);
      setMessage(response.data.detail);
      setFormData({
        content: '',
        type: 'normal',
        target_groups: [],
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Notification</h1>
          <p className="text-gray-600 mb-8">Send bulk notifications to user groups</p>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-emerald-700">{message}</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Target Groups */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Target Groups <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {TARGET_GROUPS.map(group => (
                    <label
                      key={group.value}
                      className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.target_groups.includes(group.value)
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="target_groups"
                        value={group.value}
                        checked={formData.target_groups.includes(group.value)}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">{group.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {NOTIFICATION_TYPES.map(type => (
                    <label
                      key={type.value}
                      className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.type === type.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  rows={4}
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter notification message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Notifications'
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}