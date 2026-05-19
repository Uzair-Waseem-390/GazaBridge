// frontend/src/pages/dashboard/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getUserStats();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: '👥', color: 'from-blue-500 to-cyan-500', path: '/admin/users/volunteers' },
    { label: 'Volunteers', value: stats?.volunteers || 0, icon: '🙌', color: 'from-emerald-500 to-teal-500', path: '/admin/users/volunteers' },
    { label: 'Seekers', value: stats?.seekers || 0, icon: '🌟', color: 'from-purple-500 to-pink-500', path: '/admin/users/seekers' },
    { label: 'Both Roles', value: stats?.both || 0, icon: '🔄', color: 'from-orange-500 to-red-500', path: '/admin/users/both' },
    { label: 'Managers', value: stats?.managers || 0, icon: '👔', color: 'from-indigo-500 to-blue-500', path: '/admin/users/managers' },
    { label: 'Admins', value: stats?.admins || 0, icon: '🛡️', color: 'from-yellow-500 to-orange-500', path: '/admin/users/admins' },
    { label: 'Inactive', value: stats?.inactive || 0, icon: '⏸️', color: 'from-red-500 to-pink-500', path: '/admin/users/inactive' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Welcome */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.first_name || 'Admin'}! Here's an overview of the platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map(stat => (
            <Link key={stat.label} to={stat.path}>
              <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {stat.icon}
                </div>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-1" />
                ) : (
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                )}
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/notifications">
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">📢</div>
              <h3 className="font-bold text-gray-900 mb-2">Send Notifications</h3>
              <p className="text-sm text-gray-600">Send bulk notifications to user groups</p>
            </motion.div>
          </Link>
          <Link to="/admin/resources">
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold text-gray-900 mb-2">Manage Resources</h3>
              <p className="text-sm text-gray-600">Create and manage learning resources</p>
            </motion.div>
          </Link>
          <Link to="/admin/posts">
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-bold text-gray-900 mb-2">Manage Posts</h3>
              <p className="text-sm text-gray-600">Review and manage community posts</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}