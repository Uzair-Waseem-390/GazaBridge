// frontend/src/components/PostCard.jsx - Updated with edit functionality and offer links
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

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

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  closed: 'bg-red-100 text-red-700 border-red-200',
};

export default function PostCard({ post, type, index, canEdit, canDelete, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedDescription = post.description?.length > 150
    ? post.description.substring(0, 150) + '...'
    : post.description;

  const name = type === 'offer' ? post.offer_name : post.request_name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
    >
      {/* Status Badge */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[post.status] || STATUS_COLORS.active}`}>
        {post.status}
      </div>

      {/* Type Badge */}
      <div className="absolute top-4 left-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          type === 'offer' 
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'bg-purple-100 text-purple-700 border border-purple-200'
        }`}>
          {type === 'offer' ? '🙌 Offer' : '🌟 Request'}
        </span>
      </div>

      <div className="p-6 pt-16">
        {/* Category Icon */}
        <div className="text-4xl mb-4">
          {CATEGORY_ICONS[post.category] || '📌'}
        </div>

        {/* Name */}
        {type === 'offer' ? (
          <Link to={`/offers/${post.id}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors hover:text-emerald-600">
              {name}
            </h3>
          </Link>
        ) : (
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
            {name}
          </h3>
        )}

        {/* Category */}
        <div className="mb-3">
          <span className="text-sm text-gray-500">
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {isExpanded ? post.description : truncatedDescription}
          </p>
          {post.description?.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-1 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Availability (only for offers) */}
        {type === 'offer' && post.availability && (
          <div className="mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-600">
              {AVAILABILITY_LABELS[post.availability] || post.availability}
            </span>
          </div>
        )}

        {/* View Details Link (only for offers) */}
        {type === 'offer' && (
          <Link
            to={`/offers/${post.id}`}
            className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium hover:text-emerald-700 transition-colors mt-3 mb-3"
          >
            View Details
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {post.user_full_name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{post.user_full_name}</p>
            <p className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Actions - Always visible for owner, visible on hover for others */}
          <div className={`flex gap-1 transition-opacity ${
            canEdit || canDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            {canEdit && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(post)}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                title="Edit post"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
            )}
            {canDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(post.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete post"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}