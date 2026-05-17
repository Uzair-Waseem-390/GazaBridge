// frontend/src/pages/OfferDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../api/posts';
import LinkCourseModal from '../components/LinkCourseModal';
import LinkLiveSectionModal from '../components/LinkLiveSectionModal';
import EditPostModal from '../components/EditPostModal';

const CATEGORY_ICONS = {
  learn_language: '🗣️',
  learn_tech_ai: '🤖',
  career_cv_help: '💼',
  mental_health_support: '🧠',
  academic_tuition: '📖',
  creative_skill: '🎨',
  others: '📌',
};

const CATEGORY_LABELS = {
  learn_language: 'Learn a Language',
  learn_tech_ai: 'Learn Tech / AI',
  career_cv_help: 'Career / CV Help',
  mental_health_support: 'Mental Health Support',
  academic_tuition: 'Academic Tuition',
  creative_skill: 'Creative Skill',
  others: 'Others',
};

const AVAILABILITY_LABELS = {
  '1_2_hours': '1-2 hours/week',
  '3_5_hours': '3-5 hours/week',
  '6_8_hours': '6-8 hours/week',
  '8_10_hours': '8-10 hours/week',
  '10_plus_hours': '10+ hours/week',
};

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offer, setOffer] = useState(null);
  const [linkedCourses, setLinkedCourses] = useState([]);
  const [linkedLiveSections, setLinkedLiveSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showLinkLiveSectionModal, setShowLinkLiveSectionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchOffer = async () => {
    try {
      const response = await postsAPI.getOffer(id);
      setOffer(response.data);
      
      // Fetch linked courses and live sections
      const [coursesRes, liveSectionsRes] = await Promise.all([
        postsAPI.getOfferLinkedCourses(id).catch(() => ({ data: [] })),
        postsAPI.getOfferLinkedLiveSections(id).catch(() => ({ data: [] })),
      ]);
      
      setLinkedCourses(coursesRes.data || []);
      setLinkedLiveSections(liveSectionsRes.data || []);
    } catch (err) {
      setError('Failed to load offer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffer();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    
    try {
      await postsAPI.deleteOffer(id);
      navigate('/posts');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete offer');
    }
  };

  const canEdit = offer && (offer.user === user?.id || user?.is_staff || user?.is_superuser);
  const canDelete = offer && (offer.user === user?.id || user?.is_staff || user?.is_superuser || user?.roles?.some(r => r.name === 'manager'));
  const canLink = offer && (offer.user === user?.id || user?.is_staff || user?.is_superuser);

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Offer not found</h2>
          <Link to="/posts" className="text-emerald-600 font-semibold">← Back to Posts</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/posts" className="inline-flex items-center gap-2 text-emerald-600 font-semibold mb-6">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Posts
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Offer Details */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                    🙌 Offer
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    offer.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    offer.status === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {offer.status}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{offer.offer_name}</h1>
                <div className="flex items-center gap-2 text-gray-500 mb-4">
                  <span className="text-2xl">{CATEGORY_ICONS[offer.category]}</span>
                  <span>{CATEGORY_LABELS[offer.category] || offer.category}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {canEdit && (
                  <button onClick={() => setShowEditModal(true)} 
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-semibold text-sm hover:bg-yellow-200 transition-colors">
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button onClick={handleDelete}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold text-sm hover:bg-red-200 transition-colors">
                    Delete
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">{offer.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500">Availability</div>
                <div className="font-semibold">{AVAILABILITY_LABELS[offer.availability] || offer.availability}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500">Posted</div>
                <div className="font-semibold">{new Date(offer.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                {offer.user_full_name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-medium">{offer.user_full_name}</div>
                <div className="text-sm text-gray-500">{offer.user_email}</div>
              </div>
            </div>
          </div>

          {/* Linked Courses Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Linked Courses ({linkedCourses.length})
              </h2>
              {canLink && (
                <button onClick={() => setShowLinkModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all">
                  Manage Links
                </button>
              )}
            </div>

            {linkedCourses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-gray-500">No courses linked to this offer yet.</p>
                {canLink && (
                  <button onClick={() => setShowLinkModal(true)}
                    className="mt-4 text-emerald-600 font-semibold text-sm hover:text-emerald-700">
                    Link a course →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {linkedCourses.map(course => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="block p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            course.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {course.status}
                          </span>
                          <span className="text-xs text-gray-400">by {course.user_email}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Linked Live Sections Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Linked Live Sections ({linkedLiveSections.length})
              </h2>
              {canLink && (
                <button onClick={() => setShowLinkLiveSectionModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all">
                  Manage Live Section Links
                </button>
              )}
            </div>

            {linkedLiveSections.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📡</div>
                <p className="text-gray-500">No live sections linked to this offer yet.</p>
                {canLink && (
                  <button onClick={() => setShowLinkLiveSectionModal(true)}
                    className="mt-4 text-purple-600 font-semibold text-sm hover:text-purple-700">
                    Link a live section →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {linkedLiveSections.map(ls => (
                  <Link
                    key={ls.id}
                    to={`/live-sections/${ls.id}`}
                    className="block p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {ls.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            ls.effective_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {ls.effective_status}
                          </span>
                          <span className="text-xs text-gray-400">by {ls.user_email}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">Ends: {new Date(ls.ending_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showLinkModal && (
          <LinkCourseModal
            offerId={id}
            onClose={() => setShowLinkModal(false)}
            onLinked={fetchOffer}
          />
        )}
        {showLinkLiveSectionModal && (
          <LinkLiveSectionModal
            offerId={id}
            onClose={() => setShowLinkLiveSectionModal(false)}
            onLinked={fetchOffer}
          />
        )}
        {showEditModal && (
          <EditPostModal
            post={offer}
            type="offer"
            onClose={() => setShowEditModal(false)}
            onUpdated={(updatedOffer) => {
              setOffer(updatedOffer);
              setShowEditModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}