// frontend/src/components/layout/AdminSidebar.jsx
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const adminNavItems = [
  {
    section: 'Admin',
    items: [
      {
        label: 'Dashboard',
        path: '/admin',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        label: 'Send Notifications',
        path: '/admin/notifications',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'User Management',
    items: [
      {
        label: 'Volunteers',
        path: '/admin/users/volunteers',
        icon: '🙌',
      },
      {
        label: 'Seekers',
        path: '/admin/users/seekers',
        icon: '🌟',
      },
      {
        label: 'Both Roles',
        path: '/admin/users/both',
        icon: '🔄',
      },
      {
        label: 'Managers',
        path: '/admin/users/managers',
        icon: '👔',
      },
      {
        label: 'Admins',
        path: '/admin/users/admins',
        icon: '🛡️',
      },
      {
        label: 'Inactive Users',
        path: '/admin/users/inactive',
        icon: '⏸️',
      },
    ],
  },
  {
    section: 'Content Management',
    items: [
      {
        label: 'Resources',
        path: '/admin/resources',
        icon: '📚',
      },
      {
        label: 'Posts',
        path: '/admin/posts',
        icon: '📝',
      },
      {
        label: 'Courses',
        path: '/admin/courses',
        icon: '📖',
      },
      {
        label: 'Live Sections',
        path: '/admin/live-sections',
        icon: '📡',
      },
    ],
  },
  {
    section: 'Main App',
    items: [
      {
        label: 'Posts',
        path: '/posts',
        icon: '📝',
      },
      {
        label: 'Courses',
        path: '/courses',
        icon: '📖',
      },
      {
        label: 'Live Sections',
        path: '/live-sections',
        icon: '📡',
      },
      {
        label: 'Resources',
        path: '/resources',
        icon: '📚',
      },
      {
        label: 'Chat',
        path: '/chat',
        icon: '💬',
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: '🔔',
      },
      {
        label: 'Profile',
        path: '/profile',
        icon: '👤',
      },
    ],
  },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="py-6">
      <nav className="space-y-6">
        {adminNavItems.map((section) => (
          <div key={section.section}>
            <div className="px-6 mb-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.section}
              </h2>
            </div>
            <div className="space-y-1 px-3">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/admin' && location.pathname.startsWith(item.path));
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-base">
                      {typeof item.icon === 'string' ? item.icon : item.icon}
                    </span>
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeAdminSidebar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full"
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}