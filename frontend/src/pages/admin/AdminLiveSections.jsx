// frontend/src/pages/admin/AdminLiveSections.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { liveSectionsAPI } from '../../api/liveSections';
import { useAuth } from '../../context/AuthContext';

// Similar structure to AdminCourses but for live sections
// Reuse the same pattern with live section specific fields

export default function AdminLiveSections() {
  const { user } = useAuth();
  const [liveSections, setLiveSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ category: '', status: '', skill_level: '' });

  const fetchLiveSections = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, page_size: 20 };
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.skill_level) params.skill_level = filters.skill_level;

      const response = await liveSectionsAPI.getLiveSections(params);
      const data = response.data;
      setLiveSections(data.results || data);
      setPagination({ page: data.page || page, totalPages: data.total_pages || 1 });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLiveSections(1); }, [fetchLiveSections]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this live section?')) return;
    try { await liveSectionsAPI.deleteLiveSection(id); setLiveSections(prev => prev.filter(ls => ls.id !== id)); }
    catch (err) { alert(err.response?.data?.detail || 'Failed to delete'); }
  };

  const handleStatusChange = async (ls, newStatus) => {
    try {
      const response = await liveSectionsAPI.updateLiveSection(ls.id, { status: newStatus });
      setLiveSections(prev => prev.map(l => l.id === ls.id ? response.data : l));
    } catch (err) { alert(err.response?.data?.detail || 'Failed to update'); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin" className="p-2 hover:bg-white rounded-xl transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Live Sections</h1>
            <p className="text-gray-600 mt-1">View and manage all live sections</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Author</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Ends</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b"><td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48 animate-pulse" /></td><td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></td><td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse" /></td><td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></td><td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse" /></td><td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse ml-auto" /></td></tr>
                  ))
                ) : liveSections.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No live sections found</td></tr>
                ) : (
                  liveSections.map(ls => (
                    <motion.tr key={ls.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link to={`/live-sections/${ls.id}`} className="font-medium text-gray-900 hover:text-emerald-600">{ls.title}</Link>
                      </td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{ls.category}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-600">{ls.user_full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(ls.ending_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <select value={ls.status} onChange={(e) => handleStatusChange(ls, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border outline-none cursor-pointer ${ls.status === 'active' ? 'bg-emerald-50 text-emerald-700' : ls.status === 'inactive' ? 'bg-gray-50 text-gray-700' : 'bg-red-50 text-red-700'}`}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/live-sections/${ls.id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></Link>
                          <button onClick={() => handleDelete(ls.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}