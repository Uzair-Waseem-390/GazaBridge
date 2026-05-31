// frontend/src/components/Navbar.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";

import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "FAQ", href: "/faq" },
];

// ─── Magnetic wrapper ─────────────────────────────────────────────────────────
function Magnetic({ children, strength = 0.35 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, {
    stiffness: 250,
    damping: 18,
  });

  const sy = useSpring(y, {
    stiffness: 250,
    damping: 18,
  });

  const ref = useRef(null);

  const onMove = useCallback(
    (e) => {
      const r = ref.current?.getBoundingClientRect();

      if (!r) return;

      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength);
    },
    [strength, x, y],
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

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

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenu] = useState(false);

  const location = useLocation();

  const { isAuthenticated, user, logout } = useAuth();

  const containerRef = useRef(null);

  const [hoverStyle, setHoverStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) setMobileMenu(false);
  }, [location.pathname, isMobileMenuOpen]);

  // Hover pill tracking
  const handleLinkEnter = (e) => {
    const container = containerRef.current;

    if (!container) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setHoverStyle({
      left: rect.left - containerRect.left,
      width: rect.width,
      opacity: 1,
    });
  };

  const handleContainerLeave = () => {
    setHoverStyle((prev) => ({
      ...prev,
      opacity: 0,
    }));
  };

  const isActive = (href) =>
    href === "/"
      ? location.pathname === "/"
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
            ? "bg-white/80 backdrop-blur-2xl shadow-lg shadow-black/5 border-b border-[#808000]/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-[78px] flex items-center justify-between">
          {/* ── Logo ── */}
          <Link to="/">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.06 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
            >
              <img
                src="/assets/public/gazabrige.jpg"
                alt="GazaBridge Logo"
                className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              />
            </motion.div>
          </Link>

          {/* ── Desktop nav links ── */}
          <div
            ref={containerRef}
            onMouseLeave={handleContainerLeave}
            className="hidden md:flex items-center relative"
          >
            {/* Hover background pill */}
            <motion.div
              className="bg-[#E07A1B]/10"
              animate={hoverStyle}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 28,
              }}
            />

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
                      transition={{
                        delay: i * 0.07,
                        duration: 0.5,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full transition-colors duration-200 select-none
                      ${
                        active
                          ? "text-[#C26100]"
                          : "text-gray-600 hover:text-[#C26100]"
                      }`}
                    >
                      {/* Active dot */}
                      {active && (
                        <motion.span
                          layoutId="nav-dot"
                          className="w-1.5 h-1.5 rounded-full bg-[#C26100] flex-shrink-0"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
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
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                {/* Chat link */}
                <Link to="/chat">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-colors
                      ${
                        location.pathname === "/chat"
                          ? "text-[#808000] bg-[#808000]/10"
                          : "text-gray-600 hover:text-[#808000] hover:bg-[#808000]/10"
                      }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    Chat
                  </motion.div>
                </Link>

                {/* User avatar - تم إصلاح قفلة الـ Magnetic هنا */}
                <Magnetic strength={0.25}>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-[#E07A1B]/5 border border-[#E07A1B]/10 rounded-full cursor-default"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#808000] to-[#949413] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {user?.first_name?.[0] || user?.email?.[0] || "U"}
                    </div>

                    <span className="text-sm font-medium text-gray-700">
                      {user?.first_name || "User"}
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
                {/* Login */}
                <Magnetic strength={0.3}>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-[#808000] rounded-full hover:bg-[#808000]/10 transition-all duration-200"
                    >
                      Log In
                    </motion.button>
                  </Link>
                </Magnetic>

                {/* Register - تم إصلاح وسم الإغلاق هنا أيضاً */}
                <Magnetic>
                  <Link to="/register">
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 16px 40px rgba(194,97,0,0.25)",
                      }}
                      whileTap={{ scale: 0.96 }}
                      className="group relative px-6 py-2.5 text-sm font-bold text-white rounded-full overflow-hidden shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #C26100, #E07A1B)",
                      }}
                    >
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-[#945005] to-[#C26100] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <span className="relative z-10 flex items-center gap-1.5">
                        Get Started
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{
                            duration: 1.6,
                            repeat: Infinity,
                          }}
                          className="text-xs"
                        >
                          →
                        </motion.span>
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
            className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#808000]/10 transition-colors"
          >
            <div className="flex flex-col gap-[5px] w-5">
              <motion.span
                animate={
                  isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.3 }}
                className="block h-0.5 w-full bg-[#808000] rounded-full origin-center"
              />

              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { opacity: 0, x: -6 }
                    : { opacity: 1, x: 0 }
                }
                transition={{ duration: 0.2 }}
                className="block h-0.5 w-full bg-[#808000] rounded-full"
              />

              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { rotate: -45, y: -7 }
                    : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.3 }}
                className="block h-0.5 w-full bg-[#808000] rounded-full origin-center"
              />
            </div>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}