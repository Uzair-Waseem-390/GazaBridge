// frontend/src/pages/Posts.jsx - Updated with beautiful confirmation modal
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../api/posts';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import EditPostModal from '../components/EditPostModal';

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
  { value: '', label: 'All Categories', icon: '📚' },
  { value: 'learn_language', label: 'Learn a Language', icon: '🗣️' },
  { value: 'learn_tech_ai', label: 'Learn Tech / AI', icon: '🤖' },
  { value: 'career_cv_help', label: 'Career / CV Help', icon: '💼' },
  { value: 'mental_health_support', label: 'Mental Health Support', icon: '🧠' },
  { value: 'academic_tuition', label: 'Academic Tuition', icon: '📖' },
  { value: 'creative_skill', label: 'Creative Skill', icon: '🎨' },
  { value: 'others', label: 'Others', icon: '📌' },
];

const AVAILABILITY = [
  { value: '1_2_hours', label: '1-2 hours/week' },
  { value: '3_5_hours', label: '3-5 hours/week' },
  { value: '6_8_hours', label: '6-8 hours/week' },
  { value: '8_10_hours', label: '8-10 hours/week' },
  { value: '10_plus_hours', label: '10+ hours/week' },
];

const STATUS = [
  { value: 'active', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-700' },
  { value: 'closed', label: 'Closed', color: 'bg-red-100 text-red-700' },
];

export default function Posts() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('offers');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    availability: '',
    status: '',
    ordering: '-created_at',
  });
  const [searchInput, setSearchInput] = useState('');

  const fetchPosts = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        page_size: 12,
        ordering: filters.ordering,
      };
      
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (activeTab === 'offers' && filters.availability) params.availability = filters.availability;

      const response = activeTab === 'offers' 
        ? await postsAPI.getOffers(params)
        : await postsAPI.getRequests(params);
      
      const data = response.data;

      if (append) {
        setPosts(prev => [...prev, ...(data.results || data)]);
      } else {
        setPosts(data.results || data);
      }

      setPagination({
        page: data.page || page,
        totalPages: data.total_pages || 1,
        totalCount: data.count || (data.results || data).length,
      });
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to load ${activeTab}`);
      console.error(`Error fetching ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters({ category: '', search: '', availability: '', status: '', ordering: '-created_at' });
    setSearchInput('');
    setPosts([]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleDelete = async () => {
    const id = deleteModal.postId;
    try {
      if (activeTab === 'offers') {
        await postsAPI.deleteOffer(id);
      } else {
        await postsAPI.deleteRequest(id);
      }
      setPosts(prev => prev.filter(p => p.id !== id));
      setPagination(prev => ({ ...prev, totalCount: prev.totalCount - 1 }));
      setDeleteModal({ isOpen: false, postId: null });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete post');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
  };

  const handleUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    setEditingPost(null);
  };

  const handleLoadMore = () => {
    if (!loading && pagination.page < pagination.totalPages) {
      fetchPosts(pagination.page + 1, true);
    }
  };

  // Permission checks
  const canEditPost = (post) => {
    if (!user) return false;
    if (post.user === user.id) return true;
    if (user.is_staff || user.is_superuser) return true;
    return false;
  };

  const canDeletePost = (post) => {
    if (!user) return false;
    if (post.user === user.id) return true;
    if (user.is_staff || user.is_superuser) return true;
    if (user.roles?.some(r => r.name === 'manager')) return true;
    return false;
  };

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Community Posts
              </h1>
              <p className="text-lg text-gray-600">
                Browse offers and requests from the community
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Post
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { value: 'offers', label: '🙌 Offers', description: 'What people are offering' },
              { value: 'requests', label: '🌟 Requests', description: 'What people need' },
            ].map(tab => (
              <motion.button
                key={tab.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabChange(tab.value)}
                className={`flex-1 p-4 rounded-2xl text-left transition-all ${
                  activeTab === tab.value
                    ? 'bg-white shadow-lg border-2 border-emerald-500'
                    : 'bg-white/50 border-2 border-transparent hover:border-gray-200'
                }`}
              >
                <div className="text-lg font-semibold text-gray-900">{tab.label}</div>
                <div className="text-sm text-gray-500">{tab.description}</div>
              </motion.button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Search
              </motion.button>
              {filters.search && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchInput('');
                    setFilters(prev => ({ ...prev, search: '' }));
                  }}
                  className="px-4 py-3 text-gray-600 hover:text-gray-900 font-medium rounded-xl border border-gray-300 transition-all"
                >
                  Clear
                </motion.button>
              )}
            </form>

            <div className="flex flex-wrap gap-2">
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">All Statuses</option>
                {STATUS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {activeTab === 'offers' && (
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">All Availability</option>
                  {AVAILABILITY.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Posts Grid */}
        {loading && posts.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-6">{activeTab === 'offers' ? '🙌' : '🌟'}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No {activeTab} found
            </h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.category || filters.status
                ? 'Try adjusting your search or filters.'
                : `Be the first to create a ${activeTab === 'offers' ? 'offer' : 'request'}!`}
            </p>
            {(filters.search || filters.category || filters.status) && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setFilters({ category: '', search: '', availability: '', status: '', ordering: '-created_at' });
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
            {!filters.search && !filters.category && !filters.status && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg"
              >
                Create Your First Post
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {posts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    type={activeTab === 'offers' ? 'offer' : 'request'}
                    index={index}
                    canEdit={canEditPost(post)}
                    canDelete={canDeletePost(post)}
                    onEdit={handleEdit}
                    onDelete={() => setDeleteModal({ isOpen: true, postId: post.id })}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Load More */}
            {pagination.page < pagination.totalPages && (
              <div className="text-center mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Loading...' : `Load More (${pagination.totalPages - pagination.page} pages)`}
                </motion.button>
              </div>
            )}

            <div className="text-center mt-4 text-sm text-gray-500">
              Showing {posts.length} of {pagination.totalCount} {activeTab}
            </div>
          </>
        )}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              fetchPosts(1, false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {editingPost && (
          <EditPostModal
            post={editingPost}
            type={activeTab === 'offers' ? 'offer' : 'request'}
            onClose={() => setEditingPost(null)}
            onUpdated={handleUpdate}
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