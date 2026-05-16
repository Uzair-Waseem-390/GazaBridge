// frontend/src/components/CreatePostModal.jsx - Updated to support both types
import { useState } from 'react';
import { motion } from 'framer-motion';
import { postsAPI } from '../api/posts';

const CATEGORIES = [
  { value: 'learn_language', label: '🗣️ Learn a Language' },
  { value: 'learn_tech_ai', label: '🤖 Learn Tech / AI' },
  { value: 'career_cv_help', label: '💼 Career / CV Help' },
  { value: 'mental_health_support', label: '🧠 Mental Health Support' },
  { value: 'academic_tuition', label: '📖 Academic Tuition' },
  { value: 'creative_skill', label: '🎨 Creative Skill' },
  { value: 'others', label: '📌 Others' },
];

const AVAILABILITY = [
  { value: '1_2_hours', label: '1-2 hours/week' },
  { value: '3_5_hours', label: '3-5 hours/week' },
  { value: '6_8_hours', label: '6-8 hours/week' },
  { value: '8_10_hours', label: '8-10 hours/week' },
  { value: '10_plus_hours', label: '10+ hours/week' },
];

export default function CreatePostModal({ onClose, onCreated }) {
  const [postType, setPostType] = useState('offer'); // 'offer' or 'request'
  const [formData, setFormData] = useState({
    offer_name: '',
    request_name: '',
    category: 'learn_tech_ai',
    description: '',
    availability: '3_5_hours',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nameField = postType === 'offer' ? 'offer_name' : 'request_name';
    if (!formData[nameField]?.trim() || !formData.description?.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (postType === 'offer') {
        const { request_name, ...offerData } = formData;
        await postsAPI.createOffer(offerData);
      } else {
        const { offer_name, availability, ...requestData } = formData;
        await postsAPI.createRequest(requestData);
      }
      onCreated();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create post');
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
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Post Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What would you like to create?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPostType('offer')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  postType === 'offer'
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🙌</div>
                <div className="font-semibold text-gray-900">Offer</div>
                <div className="text-sm text-gray-500">I want to teach/help</div>
              </button>
              <button
                type="button"
                onClick={() => setPostType('request')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  postType === 'request'
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🌟</div>
                <div className="font-semibold text-gray-900">Request</div>
                <div className="text-sm text-gray-500">I want to learn/receive help</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {postType === 'offer' ? 'Offer Name' : 'Request Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name={postType === 'offer' ? 'offer_name' : 'request_name'}
                value={formData[postType === 'offer' ? 'offer_name' : 'request_name']}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                placeholder={postType === 'offer' ? 'e.g., English Tutoring, Web Development Mentoring' : 'e.g., Need help with CV, Want to learn Python'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-none"
                placeholder={postType === 'offer' 
                  ? 'Describe what you can teach, your experience, and how you can help...' 
                  : 'Describe what you need help with, your goals, and what you\'re looking for...'}
              />
            </div>

            {postType === 'offer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Availability
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                >
                  {AVAILABILITY.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            )}

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
                {loading ? 'Creating...' : `Create ${postType === 'offer' ? 'Offer' : 'Request'}`}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}