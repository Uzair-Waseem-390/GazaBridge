// frontend/src/components/CourseCard.jsx
import { motion } from 'framer-motion';
import { useState } from "react";
import { Link } from 'react-router-dom';

const CATEGORY_ICONS = {
  teaching_language: '🗣️',
  tech_coding_ai: '🤖',
  career_mentorship: '💼',
  mental_health: '🧠',
  creative_design: '🎨',
  academic: '📖',
  others: '📌',
};

const CATEGORY_LABELS = {
  teaching_language: 'Teaching / Language',
  tech_coding_ai: 'Tech / Coding / AI',
  career_mentorship: 'Career / Mentorship',
  mental_health: 'Mental Health',
  creative_design: 'Creative / Design',
  academic: 'Academic',
  others: 'Others',
};

const SKILL_LEVEL_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  closed: 'bg-red-100 text-red-700 border-red-200',
};

const LANGUAGE_LABELS = {
  en: 'English', ur: 'Urdu', ar: 'Arabic', fr: 'French',
  es: 'Spanish', de: 'German', zh: 'Chinese', hi: 'Hindi',
  pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', tr: 'Turkish',
};

export default function CourseCard({ course, index, canDelete, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedDescription = course.description?.length > 120
    ? course.description.substring(0, 120) + '...'
    : course.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
    >
      {/* Status Badge */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[course.status] || STATUS_COLORS.active}`}>
        {course.status}
      </div>

      <div className="p-6">
        {/* Category Icon */}
        <div className="text-4xl mb-4">
          {CATEGORY_ICONS[course.category] || '📌'}
        </div>

        {/* Title */}
        <Link to={`/courses/${course.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
            {course.title}
          </h3>
        </Link>

        {/* Category */}
        <div className="mb-3">
          <span className="text-sm text-gray-500">
            {CATEGORY_LABELS[course.category] || course.category}
          </span>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {isExpanded ? course.description : truncatedDescription}
          </p>
          {course.description?.length > 120 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-1 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${SKILL_LEVEL_COLORS[course.skill_level] || 'bg-gray-100 text-gray-700'}`}>
            {course.skill_level}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            {LANGUAGE_LABELS[course.language] || course.language}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            {course.sessions_per_week}x/week • {course.session_duration}min
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.course_duration_days} days
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {course.contents_count || 0} contents
          </div>
        </div>

        {/* Author & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {course.user_full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{course.user_full_name}</p>
              <p className="text-xs text-gray-500">
                {new Date(course.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <Link
              to={`/courses/${course.id}`}
              className="flex-1 sm:flex-none text-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              View Course
            </Link>
            {canDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(course.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete course"
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