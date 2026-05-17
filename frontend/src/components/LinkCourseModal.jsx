// frontend/src/components/LinkCourseModal.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { coursesAPI } from '../api/courses';
import { postsAPI } from '../api/posts';

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

export default function LinkCourseModal({ offerId, onClose, onLinked }) {
  const [courses, setCourses] = useState([]);
  const [linkedCourseIds, setLinkedCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [unlinkModal, setUnlinkModal] = useState({ isOpen: false, courseId: null, courseTitle: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all user's courses
        const coursesResponse = await coursesAPI.getCourses({ page_size: 100 });
        setCourses(coursesResponse.data.results || coursesResponse.data);

        // Fetch already linked courses
        const linkedResponse = await postsAPI.getOfferLinkedCourses(offerId);
        setLinkedCourseIds(linkedResponse.data.map(c => c.id));
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [offerId]);

  const handleLink = async (courseId) => {
    setLinking(true);
    setError('');

    try {
      await coursesAPI.linkCourseToOffer(courseId, offerId);
      setLinkedCourseIds(prev => [...prev, courseId]);
      onLinked();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to link course');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    const courseId = unlinkModal.courseId;
    setLinking(true);
    setError('');

    try {
      await coursesAPI.unlinkCourseFromOffer(courseId, offerId);
      setLinkedCourseIds(prev => prev.filter(id => id !== courseId));
      onLinked();
      setUnlinkModal({ isOpen: false, courseId: null, courseTitle: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to unlink course');
    } finally {
      setLinking(false);
    }
  };

  const filteredCourses = courses.filter(course => 
    !searchInput || 
    course.title.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <>
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
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Link Courses to Offer</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Link your courses to this offer so learners can easily find related course content.
              You can only link courses that you own.
            </p>

            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search your courses..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-gray-500">
                  {searchInput ? 'No courses match your search.' : 'No courses available to link.'}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Create courses first, then link them to your offers.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCourses.map(course => {
                  const isLinked = linkedCourseIds.includes(course.id);
                  
                  return (
                    <div
                      key={course.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isLinked
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 capitalize">{course.skill_level}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 uppercase">{course.language}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{course.sessions_per_week}x/week</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{course.description}</p>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => isLinked 
                            ? setUnlinkModal({ isOpen: true, courseId: course.id, courseTitle: course.title })
                            : handleLink(course.id)
                          }
                          disabled={linking}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            isLinked
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg'
                          } disabled:opacity-50`}
                        >
                          {isLinked ? 'Unlink' : 'Link Course'}
                        </motion.button>
                      </div>
                      
                      {isLinked && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-200">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round"strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs text-emerald-700 font-medium">Linked to this offer</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Unlink Confirmation Modal */}
      <ConfirmationModal
        isOpen={unlinkModal.isOpen}
        onClose={() => setUnlinkModal({ isOpen: false, courseId: null, courseTitle: '' })}
        onConfirm={handleUnlink}
        title="Unlink Course"
        message={`Are you sure you want to unlink "${unlinkModal.courseTitle}" from this offer? This action can be undone by linking again.`}
        type="delete"
      />
    </>
  );
}