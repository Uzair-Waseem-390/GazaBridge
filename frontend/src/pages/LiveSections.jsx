// frontend/src/pages/LiveSections.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { liveSectionsAPI } from '../api/liveSections';
import LiveSectionCard from '../components/LiveSectionCard';
import CreateLiveSectionModal from '../components/CreateLiveSectionModal';

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
  { value: 'teaching_language', label: 'Teaching / Language', icon: '🗣️' },
  { value: 'tech_coding_ai', label: 'Tech / Coding / AI', icon: '🤖' },
  { value: 'career_mentorship', label: 'Career / Mentorship', icon: '💼' },
  { value: 'mental_health', label: 'Mental Health', icon: '🧠' },
  { value: 'creative_design', label: 'Creative / Design', icon: '🎨' },
  { value: 'academic', label: 'Academic', icon: '📖' },
  { value: 'others', label: 'Others', icon: '📌' },
];

const SKILL_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const LANGUAGES = [
  { value: '', label: 'All Languages' },
  { value: 'en', label: 'English' }, { value: 'ur', label: 'Urdu' },
  { value: 'ar', label: 'Arabic' }, { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' }, { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' }, { value: 'hi', label: 'Hindi' },
  { value: 'pt', label: 'Portuguese' }, { value: 'ru', label: 'Russian' },
  { value: 'ja', label: 'Japanese' }, { value: 'tr', label: 'Turkish' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'closed', label: 'Closed' },
];

export default function LiveSections() {
  const { user } = useAuth();
  const [liveSections, setLiveSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, liveSectionId: null, liveSectionTitle: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [filters, setFilters] = useState({
    category: '', skill_level: '', language: '', status: '',
    search: '', ordering: '-created_at',
  });
  const [searchInput, setSearchInput] = useState('');

  const fetchLiveSections = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: 12, ordering: filters.ordering };
      if (filters.category) params.category = filters.category;
      if (filters.skill_level) params.skill_level = filters.skill_level;
      if (filters.language) params.language = filters.language;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await liveSectionsAPI.getLiveSections(params);
      const data = response.data;
      if (append) {
        setLiveSections(prev => [...prev, ...(data.results || data)]);
      } else {
        setLiveSections(data.results || data);
      }
      setPagination({
        page: data.pagination?.page || page,
        totalPages: data.pagination?.total_pages || 1,
        totalCount: data.pagination?.count || (data.results || data).length,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load live sections');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLiveSections(1, false); }, [fetchLiveSections]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleDelete = async () => {
    const id = deleteModal.liveSectionId;
    try {
      const response = await liveSectionsAPI.deleteLiveSection(id);
      // Only close modal and re-fetch if delete actually succeeded (204)
      if (response.status === 204 || response.status === 200) {
        setDeleteModal({ isOpen: false, liveSectionId: null, liveSectionTitle: '' });
        await fetchLiveSections(1, false);
      } else {
        alert('Delete failed: unexpected response from server');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to delete';
      alert(`Delete failed: ${msg} (status: ${err.response?.status})`);
    }
  };

  const handleLoadMore = () => {
    if (!loading && pagination.page < pagination.totalPages) {
      fetchLiveSections(pagination.page + 1, true);
    }
  };

  const canDelete = (ls) => {
    if (!user) return false;
    if (ls.user === user.id) return true;
    if (user.is_staff || user.is_superuser) return true;
    if (user.roles?.some(r => r.name === 'manager')) return true;
    return false;
  };

  // Find live section title for the delete modal message
  const getLiveSectionTitle = () => {
    const liveSection = liveSections.find(ls => ls.id === deleteModal.liveSectionId);
    return liveSection?.title || 'this live section';
  };

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Live Sections</h1>
              <p className="text-lg text-gray-600">Time-bound live learning sessions from the community</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Live Section
            </motion.button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search live sections..." className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none" />
              </div>
              <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">Search</motion.button>
            </form>
            <div className="flex flex-wrap gap-2">
              <select value={filters.category} onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none">
                {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>)}
              </select>
              <select value={filters.skill_level} onChange={(e) => setFilters(prev => ({ ...prev, skill_level: e.target.value }))}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none">
                {SKILL_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select value={filters.language} onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none">
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none">
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"><p className="text-sm text-red-700">{error}</p></motion.div>}

        {loading && liveSections.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse"><div className="h-4 bg-gray-200 rounded w-3/4 mb-4" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>)}
          </div>
        ) : liveSections.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="text-6xl mb-6">📡</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No live sections found</h3>
            <p className="text-gray-600">Be the first to create a live section!</p>
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {liveSections.map((ls, index) => (
                  <LiveSectionCard 
                    key={ls.id} 
                    liveSection={ls} 
                    index={index} 
                    canDelete={canDelete(ls)} 
                    onDelete={() => setDeleteModal({ isOpen: true, liveSectionId: ls.id, liveSectionTitle: ls.title })}
                  />
                ))}
              </AnimatePresence>
            </div>
            {pagination.page < pagination.totalPages && (
              <div className="text-center mt-12">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLoadMore} disabled={loading}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm disabled:opacity-50">
                  {loading ? 'Loading...' : 'Load More'}
                </motion.button>
              </div>
            )}
            <div className="text-center mt-4 text-sm text-gray-500">Showing {liveSections.length} of {pagination.totalCount} live sections</div>
          </>
        )}
      </div>
      <AnimatePresence>
        {showCreateModal && <CreateLiveSectionModal onClose={() => setShowCreateModal(false)} onCreated={() => { setShowCreateModal(false); fetchLiveSections(1, false); }} />}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, liveSectionId: null, liveSectionTitle: '' })}
        onConfirm={handleDelete}
        title="Delete Live Section"
        message={`Are you sure you want to delete "${getLiveSectionTitle()}"? This will also delete all contents and unlink from offers. This action cannot be undone.`}
        type="delete"
      />
    </div>
  );
}