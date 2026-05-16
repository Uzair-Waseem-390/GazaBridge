// frontend/src/components/ResourceCard.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';

const CATEGORY_ICONS = {
  job: '💼',
  internship: '🎯',
  scholarship: '🎓',
  grant: '💰',
  fellowship: '🌟',
  funding: '💸',
  volunteer: '🤝',
  other: '📌',
};

const CATEGORY_COLORS = {
  job: 'from-blue-500 to-cyan-500',
  internship: 'from-purple-500 to-pink-500',
  scholarship: 'from-emerald-500 to-teal-500',
  grant: 'from-orange-500 to-red-500',
  fellowship: 'from-indigo-500 to-blue-500',
  funding: 'from-green-500 to-emerald-500',
  volunteer: 'from-teal-500 to-green-500',
  other: 'from-gray-500 to-slate-500',
};

export default function ResourceCard({ resource, index, canManage, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedDescription = resource.description.length > 150
    ? resource.description.substring(0, 150) + '...'
    : resource.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
    >
      {/* Category Badge */}
      <div className={`absolute top-4 right-4 px-3 py-1 bg-gradient-to-r ${CATEGORY_COLORS[resource.category] || CATEGORY_COLORS.other} text-white text-xs font-semibold rounded-full shadow-lg`}>
        {resource.category}
      </div>

      <div className="p-6">
        {/* Icon */}
        <div className="text-4xl mb-4">
          {CATEGORY_ICONS[resource.category] || '📌'}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
          {resource.title}
        </h3>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {isExpanded ? resource.description : truncatedDescription}
          </p>
          {resource.description.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-1 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {resource.user_full_name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{resource.user_full_name}</p>
            <p className="text-xs text-gray-500">
              {new Date(resource.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <motion.a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visit Link
          </motion.a>

          {canManage && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(resource.id)}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(resource.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}