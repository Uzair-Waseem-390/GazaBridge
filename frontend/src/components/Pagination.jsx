import { motion } from 'framer-motion';

/**
 * Reusable Pagination Component
 * Supports both "Load More" and "Prev/Next" styles
 */
export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  currentCount,
  loading,
  onNextPage,
  onPrevPage,
  onLoadMore,
  style = 'loadmore', // 'loadmore' or 'nav'
  className = '',
}) {
  if (totalPages <= 1) return null;

  if (style === 'loadmore') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col items-center gap-4 py-8 ${className}`}
      >
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          onClick={onLoadMore}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-[#808000] to-[#a3a322] text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            `Load More (${totalPages - currentPage} pages remaining)`
          )}
        </motion.button>
        {totalCount && (
          <p className="text-sm text-gray-600">
            Showing {currentCount} of {totalCount} items
          </p>
        )}
      </motion.div>
    );
  }

  if (style === 'nav') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between py-6 ${className}`}
      >
        <motion.button
          whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
          whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
          onClick={onPrevPage}
          disabled={currentPage === 1 || loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </motion.button>

        <span className="text-sm text-gray-600 font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <motion.button
          whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
          whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
          onClick={onNextPage}
          disabled={currentPage === totalPages || loading}
          className="px-6 py-2 bg-gradient-to-r from-[#808000] to-[#a3a322] text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </span>
          ) : (
            'Next →'
          )}
        </motion.button>
      </motion.div>
    );
  }

  return null;
}
