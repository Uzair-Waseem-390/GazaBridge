// frontend/src/pages/admin/AdminUserList.jsx - UPDATED
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../api/admin';
import { usersAPI } from '../../api/users';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = {
  volunteers: { title: 'Volunteers', icon: '🙌', description: 'Users with only volunteer role' },
  seekers: { title: 'Seekers', icon: '🌟', description: 'Users with only seeker role' },
  both: { title: 'Both Roles', icon: '🔄', description: 'Users with both volunteer and seeker roles' },
  managers: { title: 'Managers', icon: '👔', description: 'Users with manager role' },
  admins: { title: 'Admins', icon: '🛡️', description: 'Users with admin (is_staff) status' },
  inactive: { title: 'Inactive Users', icon: '⏸️', description: 'Users with inactive accounts' },
};

const API_MAP = {
  volunteers: adminAPI.getVolunteers,
  seekers: adminAPI.getSeekers,
  both: adminAPI.getBoth,
  managers: adminAPI.getManagers,
  admins: adminAPI.getAdmins,
  inactive: adminAPI.getInactiveUsers,
};

export default function AdminUserList() {
  const { role } = useParams();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null); // Track which user ID is being processed
  const [message, setMessage] = useState('');

  const roleInfo = ROLE_LABELS[role] || { title: 'Users', icon: '👥', description: '' };
  const fetchFn = API_MAP[role];

  // Check if current user is admin or superuser (can promote/demote)
  const adminRoles = ['admin', 'superuser'];
  const canManageRoles = currentUser?.roles?.some(r => adminRoles.includes(r)) || 
                         currentUser?.is_staff || 
                         currentUser?.is_superuser;

  // Show promote/demote buttons only on volunteers, seekers, both, and managers tabs
  const showRoleActions = ['volunteers', 'seekers', 'both', 'managers'].includes(role);

  const fetchUsers = async () => {
    if (!fetchFn) return;
    setLoading(true);
    try {
      const response = await fetchFn({ page, page_size: 20 });
      setUsers(response.data.results || response.data);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role, page]);

  const handlePromote = async (userId, userEmail) => {
    if (!window.confirm(`Promote ${userEmail} to manager?`)) return;
    
    setActionLoading(userId);
    setMessage('');
    
    try {
      const response = await usersAPI.promoteToManager(userId);
      setMessage(response.data.detail);
      // Refresh the list
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to promote user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemote = async (userId, userEmail) => {
    if (!window.confirm(`Demote ${userEmail} from manager?`)) return;
    
    setActionLoading(userId);
    setMessage('');
    
    try {
      const response = await usersAPI.demoteFromManager(userId);
      setMessage(response.data.detail);
      // Refresh the list
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to demote user');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin" className="p-2 hover:bg-white rounded-xl transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="text-2xl mr-2">{roleInfo.icon}</span>
              {roleInfo.title}
            </h1>
            <p className="text-gray-600 mt-1">{roleInfo.description}</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border ${
              message.includes('Failed') || message.includes('failed')
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {message.includes('Failed') || message.includes('failed') ? (
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <p className="text-sm">{message}</p>
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Roles</th>
                  {showRoleActions && canManageRoles && (
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48 animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></td>
                      {showRoleActions && canManageRoles && (
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse ml-auto" /></td>
                      )}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={showRoleActions && canManageRoles ? 4 : 3} className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {(user.first_name?.[0] || '') + (user.last_name?.[0] || '') || user.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((r, index) => (
                            <span
                              key={index}
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                r === 'manager' ? 'bg-purple-100 text-purple-700' :
                                r === 'admin' ? 'bg-yellow-100 text-yellow-700' :
                                r === 'superuser' ? 'bg-red-100 text-red-700' :
                                r === 'volunteer' ? 'bg-emerald-100 text-emerald-700' :
                                r === 'seeker' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      {showRoleActions && canManageRoles && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Promote to Manager (for volunteers, seekers, both) */}
                            {['volunteers', 'seekers', 'both'].includes(role) && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePromote(user.id, user.email)}
                                disabled={actionLoading === user.id}
                                className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1"
                                title="Promote to Manager"
                              >
                                {actionLoading === user.id ? (
                                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                    Promote
                                  </>
                                )}
                              </motion.button>
                            )}
                            
                            {/* Demote from Manager (for managers tab) */}
                            {role === 'managers' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDemote(user.id, user.email)}
                                disabled={actionLoading === user.id}
                                className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-all disabled:opacity-50 flex items-center gap-1"
                                title="Demote from Manager"
                              >
                                {actionLoading === user.id ? (
                                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                    Demote
                                  </>
                                )}
                              </motion.button>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        {showRoleActions && canManageRoles && (
          <div className="mt-6 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Role Management</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {['volunteers', 'seekers', 'both'].includes(role) && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-lg">
                    Promote
                  </span>
                  <span>Promotes user to Manager role</span>
                </div>
              )}
              {role === 'managers' && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">
                    Demote
                  </span>
                  <span>Removes Manager role from user</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Note: Only admins and superusers can promote/demote users. Changes take effect immediately.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}