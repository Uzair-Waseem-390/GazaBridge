// frontend/src/pages/Resources.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';
// import ResourceFilters from '../components/ResourceFilters';
import CreateResourceModal from '../components/CreateResourceModal';

const CATEGORIES = [
  { value: '', label: 'All Categories', icon: '📚' },
  { value: 'job', label: 'Job Resources', icon: '💼' },
  { value: 'internship', label: 'Internship Resources', icon: '🎯' },
  { value: 'scholarship', label: 'Scholarship Resources', icon: '🎓' },
  { value: 'grant', label: 'Grant Resources', icon: '💰' },
  { value: 'fellowship', label: 'Fellowship Resources', icon: '🌟' },
  { value: 'funding', label: 'Funding Resources', icon: '💸' },
  { value: 'volunteer', label: 'Volunteer Resources', icon: '🤝' },
  { value: 'other', label: 'Other Resources', icon: '📌' },
];

export default function Resources() {
  const { user } = useAuth();
  const {
    resources,
    loading,
    error,
    pagination,
    filters,
    fetchResources,
    deleteResource,
    updateFilters,
  } = useResources();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const canManage = user?.roles?.some(r => 
    ['manager', 'admin', 'superuser'].includes(r.name)
  ) || user?.is_staff || user?.is_superuser;

  useEffect(() => {
    fetchResources(1, false);
  }, [fetchResources]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    updateFilters({ category });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      const result = await deleteResource(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleLoadMore = () => {
    if (!loading && pagination.page < pagination.totalPages) {
      fetchResources(pagination.page + 1, true);
    }
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
                Resources
              </h1>
              <p className="text-lg text-gray-600">
                Discover opportunities, scholarships, jobs, and more
              </p>
            </div>
            
            {canManage && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Resource
              </motion.button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search resources..."
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
                    updateFilters({ search: '' });
                  }}
                  className="px-4 py-3 text-gray-600 hover:text-gray-900 font-medium rounded-xl border border-gray-300 hover:border-gray-400 transition-all"
                >
                  Clear
                </motion.button>
              )}
            </form>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <motion.button
                  key={cat.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
                </motion.button>
              ))}
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

        {/* Resources Grid */}
        {loading && resources.length === 0 ? (
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
        ) : resources.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.category
                ? 'Try adjusting your search or filters.'
                : 'Resources will appear here once they are added.'}
            </p>
            {(filters.search || filters.category) && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setSelectedCategory('');
                  updateFilters({ search: '', category: '' });
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {resources.map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    index={index}
                    canManage={canManage}
                    onEdit={(id) => {/* Handle edit */}}
                    onDelete={handleDelete}
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
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    `Load More (${pagination.totalPages - pagination.page} pages remaining)`
                  )}
                </motion.button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-center mt-4 text-sm text-gray-500">
              Showing {resources.length} of {pagination.totalCount} resources
            </div>
          </>
        )}
      </div>

      {/* Create Resource Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateResourceModal
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              fetchResources(1, false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}