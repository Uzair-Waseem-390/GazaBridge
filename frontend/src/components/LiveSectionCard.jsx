// frontend/src/components/LiveSectionCard.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS = { teaching_language: '🗣️', tech_coding_ai: '🤖', career_mentorship: '💼', mental_health: '🧠', creative_design: '🎨', academic: '📖', others: '📌' };
const SKILL_LEVEL_COLORS = { beginner: 'bg-green-100 text-green-700', intermediate: 'bg-yellow-100 text-yellow-700', advanced: 'bg-red-100 text-red-700' };
const LANGUAGE_LABELS = { en: 'English', ur: 'Urdu', ar: 'Arabic', fr: 'French', es: 'Spanish', de: 'German', zh: 'Chinese', hi: 'Hindi', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', tr: 'Turkish' };

export default function LiveSectionCard({ liveSection, index, canDelete, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const truncated = liveSection.description?.length > 120 ? liveSection.description.substring(0, 120) + '...' : liveSection.description;

  const effectiveStatus = liveSection.effective_status || liveSection.status;
  const isEnded = effectiveStatus === 'closed' && liveSection.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }} whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
    >
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border ${effectiveStatus === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : effectiveStatus === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
        {isEnded ? 'Ended' : effectiveStatus}
      </div>

      <div className="p-6">
        <div className="text-4xl mb-4">{CATEGORY_ICONS[liveSection.category] || '📌'}</div>
        <Link to={`/live-sections/${liveSection.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">{liveSection.title}</h3>
        </Link>
        <div className="mb-4"><p className="text-gray-600 text-sm leading-relaxed">{isExpanded ? liveSection.description : truncated}</p>
          {liveSection.description?.length > 120 && <button onClick={() => setIsExpanded(!isExpanded)} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-1">{isExpanded ? 'Show less' : 'Read more'}</button>}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${SKILL_LEVEL_COLORS[liveSection.skill_level] || 'bg-gray-100 text-gray-700'}`}>{liveSection.skill_level}</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{LANGUAGE_LABELS[liveSection.language] || liveSection.language}</span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{liveSection.sessions_per_week}x/week • {liveSection.session_duration}min</span>
        </div>
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 text-sm text-gray-500">
          <div className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Ends: {new Date(liveSection.ending_date).toLocaleDateString()}</div>
          <div className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {liveSection.contents_count || 0} contents</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{liveSection.user_full_name?.split(' ').map(n => n[0]).join('') || 'U'}</div>
            <div><p className="text-sm font-medium text-gray-900">{liveSection.user_full_name}</p><p className="text-xs text-gray-500">{new Date(liveSection.created_at).toLocaleDateString()}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/live-sections/${liveSection.id}`} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">View</Link>
            {canDelete && <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(liveSection.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></motion.button>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}