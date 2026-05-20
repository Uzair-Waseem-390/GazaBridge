// frontend/src/components/Navbar.jsx
// Design system: Instrument Serif + DM Sans — matches Home.jsx
// Deps: framer-motion (already installed)

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const navLinks = [
  { name: 'Home',         href: '/' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Services',     href: '/services' },
  { name: 'About',        href: '/about' },
  { name: 'Blog',         href: '/blog' },
  { name: 'FAQ',          href: '/faq' },
];

// ─── Magnetic wrapper ─────────────────────────────────────────────────────────
function Magnetic({ children, strength = 0.35 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }, [strength, x, y]);

  const onLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated underline indicator ────────────────────────────────────────────
// Tracks the active link with a sliding pill
function NavIndicator({ links, location }) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector('[data-active="true"]');
    if (activeEl) {
      const containerRect = container.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left:  elRect.left - containerRect.left,
        width: elRect.width,
      });
    }
  }, [location.pathname]);

  return { containerRef, indicatorStyle };
}

export default function Navbar() {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isMobileMenuOpen, setMobileMenu]   = useState(false);
  const [hoveredLink, setHoveredLink]       = useState(null);
  const location                            = useLocation();
  const { isAuthenticated, user, logout }   = useAuth();
  const containerRef                        = useRef(null);
  const [hoverStyle, setHoverStyle]         = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname]);

  // Hover pill tracking
  const handleLinkEnter = (e) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setHoverStyle({
      left:    rect.left - containerRect.left,
      width:   rect.width,
      opacity: 1,
    });
  };

  const handleContainerLeave = () => {
    setHoverStyle(prev => ({ ...prev, opacity: 0 }));
  };

  const isActive = (href) =>
    href === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(href);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full z-50"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Main bar ── */}
      <div
        className={`transition-all duration-500 ${
          isScrolled
            ? 'bg-white/85 backdrop-blur-2xl shadow-sm shadow-black/5 border-b border-gray-100/80'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/">
            <motion.div
              className="flex items-center gap-2.5"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {/* Icon — rotates to flat on hover */}
              <div className="relative w-9 h-9 flex-shrink-0">
                <motion.div
                  whileHover={{ rotate: 0 }}
                  initial={{ rotate: 12 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>

              {/* Wordmark */}
              <span
                className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                GazaBridge
              </span>
            </motion.div>
          </Link>

          {/* ── Desktop nav links — hover pill ── */}
          <div
            ref={containerRef}
            onMouseLeave={handleContainerLeave}
            className="hidden lg:flex items-center relative"
          >
            {/* Hover background pill */}
            <motion.div
              className="absolute top-1 bottom-1 bg-gray-100 rounded-full pointer-events-none"
              animate={hoverStyle}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            />

            {/* Active indicator dot */}
            <div className="flex items-center">
              {navLinks.map((link, i) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    data-active={active}
                    onMouseEnter={handleLinkEnter}
                  >
                    <motion.span
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className={`relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full transition-colors duration-200 select-none
                        ${active ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      {/* Active dot */}
                      {active && (
                        <motion.span
                          layoutId="nav-dot"
                          className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      {link.name}
                    </motion.span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Desktop auth CTA ── */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                {/* Chat link */}
                <Link to="/chat">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-colors
                      ${location.pathname === '/chat'
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Chat
                  </motion.div>
                </Link>

                {/* Admin */}
                {user?.roles?.some(r => ['manager', 'admin', 'superuser'].includes(r.name)) && (
                  <Link to="/admin">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Admin
                    </motion.div>
                  </Link>
                )}

                {/* User avatar + name */}
                <Magnetic strength={0.25}>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-gray-50 border border-gray-100 rounded-full cursor-default"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.first_name || 'User'}
                    </span>
                  </motion.div>
                </Magnetic>

                {/* Logout */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={logout}
                  className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                {/* Login — ghost */}
                <Magnetic strength={0.3}>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 rounded-full hover:bg-emerald-50 transition-all duration-200"
                    >
                      Log In
                    </motion.button>
                  </Link>
                </Magnetic>

                {/* Get Started — solid pill, same as Home CTA */}
                <Magnetic>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 16px 40px rgba(16,185,129,0.3)' }}
                      whileTap={{ scale: 0.96 }}
                      className="group relative px-6 py-2.5 text-sm font-bold text-white rounded-full overflow-hidden shadow-lg shadow-emerald-500/20"
                      style={{ background: 'linear-gradient(135deg,#10b981,#14b8a6)' }}
                    >
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center gap-1.5">
                        Get Started
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                          className="text-xs"
                        >→</motion.span>
                      </span>
                    </motion.button>
                  </Link>
                </Magnetic>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setMobileMenu(!isMobileMenuOpen)}
            className="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col gap-[5px] w-5">
              <motion.span
                animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block h-0.5 w-full bg-gray-700 rounded-full origin-center"
              />
              <motion.span
                animate={isMobileMenuOpen ? { opacity: 0, x: -6 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="block h-0.5 w-full bg-gray-700 rounded-full"
              />
              <motion.span
                animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block h-0.5 w-full bg-gray-700 rounded-full origin-center"
              />
            </div>
          </motion.button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden mx-4 mt-1 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden"
          >
            <div className="p-4">

              {/* Nav links */}
              <div className="space-y-1 mb-4">
                {navLinks.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.35 }}
                    >
                      <Link
                        to={link.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                          ${active
                            ? 'text-emerald-600 bg-emerald-50 border border-emerald-100'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 mb-4" />

              {/* Auth section */}
              {isAuthenticated ? (
                <div className="space-y-1">
                  <NotificationBell />

                  <Link to="/chat">
                    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${location.pathname === '/chat' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Chat
                    </div>
                  </Link>

                  {user?.roles?.some(r => ['manager', 'admin', 'superuser'].includes(r.name)) && (
                    <Link to="/admin">
                      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                        Admin Panel
                      </div>
                    </Link>
                  )}

                  {/* User row */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mt-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                      {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{user?.first_name || 'User'}</div>
                      <div className="text-xs text-gray-400">{user?.email}</div>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors mt-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 text-sm font-semibold text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      Log In
                    </motion.button>
                  </Link>
                  <Link to="/register">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 text-sm font-bold text-white rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg,#10b981,#14b8a6)' }}
                    >
                      Get Started Free
                      <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>→</motion.span>
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}