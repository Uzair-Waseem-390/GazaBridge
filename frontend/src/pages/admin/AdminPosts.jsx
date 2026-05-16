// frontend/src/pages/admin/AdminPosts.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { postsAPI } from '../../api/posts';
import { useAuth } from '../../context/AuthContext';

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
        <div className={`h-1 ${type === 'delete' ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`} />
        
        <div className="p-6">
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

          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-center mb-6">{message}</p>

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

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'learn_language', label: 'Learn a Language' },
  { value: 'learn_tech_ai', label: 'Learn Tech / AI' },
  { value: 'career_cv_help', label: 'Career / CV Help' },
  { value: 'mental_health_support', label: 'Mental Health Support' },
  { value: 'academic_tuition', label: 'Academic Tuition' },
  { value: 'creative_skill', label: 'Creative Skill' },
  { value: 'others', label: 'Others' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'closed', label: 'Closed' },
];

const AVAILABILITY = [
  { value: '', label: 'All Availability' },
  { value: '1_2_hours', label: '1-2 hours/week' },
  { value: '3_5_hours', label: '3-5 hours/week' },
  { value: '6_8_hours', label: '6-8 hours/week' },
  { value: '8_10_hours', label: '8-10 hours/week' },
  { value: '10_plus_hours', label: '10+ hours/week' },
];

export default function AdminPosts() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'offers';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    availability: '',
    search: '',
  });

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);

    try {
      const params = {
        page,
        page_size: 20,
      };
      
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (activeTab === 'offers' && filters.availability) params.availability = filters.availability;

      const response = activeTab === 'offers'
        ? await postsAPI.getOffers(params)
        : await postsAPI.getRequests(params);
      
      const data = response.data;
      setPosts(data.results || data);
      setPagination({
        page: data.page || page,
        totalPages: data.total_pages || 1,
      });
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleDelete = async () => {
    const id = deleteModal.postId;
    try {
      if (activeTab === 'offers') {
        await postsAPI.deleteOffer(id);
      } else {
        await postsAPI.deleteRequest(id);
      }
      setPosts(prev => prev.filter(p => p.id !== id));
      setDeleteModal({ isOpen: false, postId: null });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete post');
    }
  };

  const handleStatusChange = async (post, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (activeTab === 'offers') {
        const response = await postsAPI.updateOffer(post.id, updateData);
        setPosts(prev => prev.map(p => p.id === post.id ? response.data : p));
      } else {
        const response = await postsAPI.updateRequest(post.id, updateData);
        setPosts(prev => prev.map(p => p.id === post.id ? response.data : p));
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
  };

  const handleUpdate = async (updatedData) => {
    try {
      if (activeTab === 'offers') {
        const response = await postsAPI.updateOffer(editingPost.id, updatedData);
        setPosts(prev => prev.map(p => p.id === editingPost.id ? response.data : p));
      } else {
        const response = await postsAPI.updateRequest(editingPost.id, updatedData);
        setPosts(prev => prev.map(p => p.id === editingPost.id ? response.data : p));
      }
      setEditingPost(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update post');
    }
  };

  const isAdmin = user?.is_staff || user?.is_superuser;

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link to="/admin" className="p-2 hover:bg-white rounded-xl transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Manage Posts</h1>
              <p className="text-gray-600 mt-1">Manage all community offers and requests</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'offers'
                  ? 'bg-white shadow-lg text-emerald-600 border-2 border-emerald-500'
                  : 'bg-white/50 text-gray-600 border-2 border-transparent hover:border-gray-200'
              }`}
            >
              🙌 Offers
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'requests'
                  ? 'bg-white shadow-lg text-emerald-600 border-2 border-emerald-500'
                  : 'bg-white/50 text-gray-600 border-2 border-transparent hover:border-gray-200'
              }`}
            >
              🌟 Requests
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {activeTab === 'offers' && (
              <select
                value={filters.availability}
                onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {AVAILABILITY.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            )}
          </div>
        </motion.div>

        {/* Posts Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Author</th>
                  {activeTab === 'offers' && (
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Availability</th>
                  )}
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48 animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse" /></td>
                      {activeTab === 'offers' && (
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></td>
                      )}
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse ml-auto" /></td>
                    </tr>
                  ))
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'offers' ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                      No {activeTab} found
                    </td>
                  </tr>
                ) : (
                  posts.map(post => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {activeTab === 'offers' ? post.offer_name : post.request_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{post.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{post.user_full_name}</td>
                      {activeTab === 'offers' && (
                        <td className="px-6 py-4 text-sm text-gray-600">{post.availability}</td>
                      )}
                      <td className="px-6 py-4">
                        <select
                          value={post.status}
                          onChange={(e) => handleStatusChange(post, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border outline-none cursor-pointer ${
                            post.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            post.status === 'inactive' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleEdit(post)}
                              className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => setDeleteModal({ isOpen: true, postId: post.id })}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => fetchPosts(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchPosts(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPost && (
          <PostEditModal
            post={editingPost}
            type={activeTab}
            onClose={() => setEditingPost(null)}
            onSubmit={handleUpdate}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, postId: null })}
        onConfirm={handleDelete}
        title={`Delete ${activeTab === 'offers' ? 'Offer' : 'Request'}`}
        message={`Are you sure you want to delete this ${activeTab === 'offers' ? 'offer' : 'request'}? This action cannot be undone.`}
        type="delete"
      />
    </div>
  );
}

// Post Edit Modal
function PostEditModal({ post, type, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    [type === 'offer' ? 'offer_name' : 'request_name']: type === 'offer' ? post.offer_name : post.request_name,
    category: post.category,
    description: post.description,
    availability: post.availability || '3_5_hours',
    status: post.status,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Edit {type === 'offer' ? 'Offer' : 'Request'}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name={type === 'offer' ? 'offer_name' : 'request_name'}
                value={formData[type === 'offer' ? 'offer_name' : 'request_name']}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              >
                {CATEGORIES.filter(c => c.value).map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-none"
              />
            </div>

            {type === 'offer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                >
                  {AVAILABILITY.filter(a => a.value).map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Update'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}