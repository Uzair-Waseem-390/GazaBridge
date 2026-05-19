// frontend/src/pages/admin/AdminUserList.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../api/admin';

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const roleInfo = ROLE_LABELS[role] || { title: 'Users', icon: '👥', description: '' };
  const fetchFn = API_MAP[role];

  useEffect(() => {
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
    fetchUsers();
  }, [role, page, fetchFn]);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin" className="p-2 hover:bg-white rounded-xl transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{roleInfo.icon} {roleInfo.title}</h1>
            <p className="text-gray-600 mt-1">{roleInfo.description}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Roles</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b"><td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse" /></td><td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48 animate-pulse" /></td><td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></td></tr>
                  ))
                ) : users.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No users found</td></tr>
                ) : (
                  users.map(user => (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map(r => (
                            <span key={r} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold capitalize">{r}</span>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}