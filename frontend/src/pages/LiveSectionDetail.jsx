// frontend/src/pages/LiveSectionDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { liveSectionsAPI } from '../api/liveSections';
import EditLiveSectionModal from '../components/EditLiveSectionModal';
import AddLiveSectionContentModal from '../components/AddLiveSectionContentModal';

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

const CATEGORY_ICONS = { teaching_language: '🗣️', tech_coding_ai: '🤖', career_mentorship: '💼', mental_health: '🧠', creative_design: '🎨', academic: '📖', others: '📌' };
const LANGUAGE_LABELS = { en: 'English', ur: 'Urdu', ar: 'Arabic', fr: 'French', es: 'Spanish', de: 'German', zh: 'Chinese', hi: 'Hindi', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', tr: 'Turkish' };

export default function LiveSectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liveSection, setLiveSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [deleteLiveSectionModal, setDeleteLiveSectionModal] = useState({ isOpen: false });
  const [deleteContentModal, setDeleteContentModal] = useState({ isOpen: false, contentId: null, contentTitle: '' });

  const fetchLiveSection = async () => {
    try {
      const response = await liveSectionsAPI.getLiveSection(id);
      setLiveSection(response.data);
    } catch (err) { setError('Failed to load live section'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLiveSection(); }, [id]);

  const handleDeleteLiveSection = async () => {
    try { 
      await liveSectionsAPI.deleteLiveSection(id); 
      navigate('/live-sections'); 
    } catch (err) { 
      alert(err.response?.data?.detail || 'Failed to delete'); 
    }
  };

  const handleDeleteContent = async () => {
    const contentId = deleteContentModal.contentId;
    try { 
      await liveSectionsAPI.deleteContent(contentId); 
      fetchLiveSection(); 
      setDeleteContentModal({ isOpen: false, contentId: null, contentTitle: '' });
    } catch (err) { 
      alert(err.response?.data?.detail || 'Failed to delete'); 
    }
  };

  const canEdit = liveSection && (liveSection.user === user?.id || user?.is_staff || user?.is_superuser);
  const canDelete = liveSection && (liveSection.user === user?.id || user?.is_staff || user?.is_superuser || user?.roles?.some(r => r.name === 'manager'));
  const canAddContent = liveSection && (liveSection.user === user?.id || user?.is_staff || user?.is_superuser);

  const effectiveStatus = liveSection?.effective_status || liveSection?.status;
  const isEnded = effectiveStatus === 'closed' && liveSection?.status === 'active';

  // Find content title for the delete modal message
  const getContentTitle = () => {
    const content = liveSection?.contents?.find(c => c.id === deleteContentModal.contentId);
    return content?.content_title || 'this content';
  };

  if (loading) return <div className="pt-24 min-h-screen flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;
  if (error || !liveSection) return <div className="pt-24 min-h-screen flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold text-gray-900 mb-4">Not found</h2><Link to="/live-sections" className="text-emerald-600 font-semibold">← Back</Link></div></div>;

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/live-sections" className="inline-flex items-center gap-2 text-emerald-600 font-semibold mb-6">← Back</Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${effectiveStatus === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{isEnded ? 'Ended' : effectiveStatus}</span>
                  {isEnded && <span className="text-xs text-red-500">(Auto-closed, ending date passed)</span>}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{liveSection.title}</h1>
                <div className="flex items-center gap-2 text-gray-500"><span className="text-2xl">{CATEGORY_ICONS[liveSection.category]}</span><span>{liveSection.category}</span></div>
              </div>
              <div className="flex gap-2">
                {canEdit && <button onClick={() => setShowEditModal(true)} className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-semibold text-sm">Edit</button>}
                {canDelete && <button onClick={() => setDeleteLiveSectionModal({ isOpen: true })} className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold text-sm">Delete</button>}
              </div>
            </div>
            <p className="text-gray-600 mb-6">{liveSection.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl"><div className="text-sm text-gray-500">Skill Level</div><div className="font-semibold capitalize">{liveSection.skill_level}</div></div>
              <div className="p-4 bg-gray-50 rounded-xl"><div className="text-sm text-gray-500">Language</div><div className="font-semibold">{LANGUAGE_LABELS[liveSection.language] || liveSection.language}</div></div>
              <div className="p-4 bg-gray-50 rounded-xl"><div className="text-sm text-gray-500">Sessions/Week</div><div className="font-semibold">{liveSection.sessions_per_week}</div></div>
              <div className="p-4 bg-gray-50 rounded-xl"><div className="text-sm text-gray-500">Duration</div><div className="font-semibold">{liveSection.session_duration} min</div></div>
              <div className="p-4 bg-gray-50 rounded-xl"><div className="text-sm text-gray-500">Total Days</div><div className="font-semibold">{liveSection.duration_days} days</div></div>
              <div className="p-4 bg-gray-50 rounded-xl col-span-2"><div className="text-sm text-gray-500">Ending Date</div><div className="font-semibold">{new Date(liveSection.ending_date).toLocaleString()}</div></div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">{liveSection.user_full_name?.split(' ').map(n => n[0]).join('')}</div>
              <div><div className="font-medium">{liveSection.user_full_name}</div><div className="text-sm text-gray-500">{liveSection.user_email}</div></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Contents ({liveSection.contents?.length || 0})</h2>
              {canAddContent && <button onClick={() => setShowAddContentModal(true)} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm">Add Content</button>}
            </div>
            {liveSection.contents?.length === 0 ? <p className="text-gray-500 text-center py-8">No content yet.</p> : (
              <div className="space-y-4">
                {liveSection.contents?.map((c, i) => (
                  <div key={c.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">{i + 1}</div>
                    <div className="flex-1"><h3 className="font-semibold">{c.content_title}</h3>{c.description && <p className="text-sm text-gray-600 mt-1">{c.description}</p>}<a href={c.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm mt-2 inline-block">Open →</a></div>
                    {(c.user === user?.id || user?.is_staff || user?.is_superuser) && (
                      <button onClick={() => setDeleteContentModal({ isOpen: true, contentId: c.id, contentTitle: c.content_title })} className="text-red-500 hover:text-red-700">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {showEditModal && <EditLiveSectionModal liveSection={liveSection} onClose={() => setShowEditModal(false)} onUpdated={fetchLiveSection} />}
        {showAddContentModal && <AddLiveSectionContentModal lsId={id} onClose={() => setShowAddContentModal(false)} onAdded={fetchLiveSection} />}
      </AnimatePresence>

      {/* Delete Live Section Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteLiveSectionModal.isOpen}
        onClose={() => setDeleteLiveSectionModal({ isOpen: false })}
        onConfirm={handleDeleteLiveSection}
        title="Delete Live Section"
        message={`Are you sure you want to delete "${liveSection?.title}"? This action cannot be undone.`}
        type="delete"
      />

      {/* Delete Content Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteContentModal.isOpen}
        onClose={() => setDeleteContentModal({ isOpen: false, contentId: null, contentTitle: '' })}
        onConfirm={handleDeleteContent}
        title="Delete Content"
        message={`Are you sure you want to delete "${getContentTitle()}"? This action cannot be undone.`}
        type="delete"
      />
    </div>
  );
}