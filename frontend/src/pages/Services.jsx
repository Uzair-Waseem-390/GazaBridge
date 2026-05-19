// frontend/src/pages/Services.jsx
// Design system: Instrument Serif + DM Sans — same as Home.jsx
// Deps: framer-motion (already installed)

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';

// ── Noise overlay ──────────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] mix-blend-overlay"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="noise-sv">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-sv)" />
    </svg>
  );
}

// ── Magnetic button wrapper ────────────────────────────────────────────────────
import { useMotionValue, useSpring } from 'framer-motion';
import { useCallback } from 'react';

function Magnetic({ children, strength = 0.4 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }, [strength, x, y]);

  const onLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </motion.div>
  );
}

// ── Category accent colours ────────────────────────────────────────────────────
const catAccent = {
  Development: { pill: 'bg-blue-50 text-blue-700 border-blue-100',   dot: 'bg-blue-400',    hover: 'hover:border-blue-200'   },
  Design:      { pill: 'bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-400', hover: 'hover:border-purple-200' },
  Marketing:   { pill: 'bg-orange-50 text-orange-700 border-orange-100', dot: 'bg-orange-400', hover: 'hover:border-orange-200' },
  Data:        { pill: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-400', hover: 'hover:border-emerald-200' },
  Security:    { pill: 'bg-red-50 text-red-700 border-red-100',       dot: 'bg-red-400',     hover: 'hover:border-red-200'    },
  Career:      { pill: 'bg-teal-50 text-teal-700 border-teal-100',    dot: 'bg-teal-400',    hover: 'hover:border-teal-200'   },
};

const ALL = 'All';
const categories = [ALL, 'Development', 'Design', 'Marketing', 'Data', 'Security', 'Career'];

export default function Services() {
  const [activeTab, setActiveTab] = useState(ALL);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY    = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const filtered = useMemo(
    () => activeTab === ALL ? services : services.filter(s => s.category === activeTab),
    [activeTab]
  );

  return (
    <div className="bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ════════════════════════════════════ HERO — same dark as Home ══ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden pt-24"
        style={{ background: '#0a0f0a' }}
      >
        <NoiseOverlay />

        {/* Emerald grid — identical to Home hero grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.07) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(16,185,129,0.07) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Glow orbs — mirrors Home */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Architectural rings (right side) */}
        <div className="absolute -right-48 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-emerald-500/10 pointer-events-none" />
        <div className="absolute -right-72 top-1/2 -translate-y-1/2 w-[960px] h-[960px] rounded-full border border-emerald-500/5 pointer-events-none" />

        {/* Spinning badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="absolute top-36 right-20 hidden xl:flex items-center justify-center w-28 h-28"
        >
          <svg className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite]" viewBox="0 0 112 112">
            <path id="c-sv" d="M56,56 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" fill="none" />
            <text fontSize="10" fontFamily="DM Sans,sans-serif" fill="#34d399" fontWeight="500" letterSpacing="3">
              <textPath href="#c-sv">22 SKILLS • ALL FREE • 22 SKILLS • ALL FREE • </textPath>
            </text>
          </svg>
          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
            <span className="text-white text-xl">✦</span>
          </div>
        </motion.div>

        {/* Hero content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative max-w-7xl mx-auto px-6 w-full"
        >
          <div className="max-w-3xl space-y-8">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="h-px w-8 bg-emerald-400" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400">What We Offer</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="leading-[0.95] tracking-tight"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 'clamp(3rem,6.5vw,6rem)',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              Skills That<br />
              <em
                style={{
                  background: 'linear-gradient(90deg,#34d399,#14b8a6,#22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Pay Bills
              </em>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="text-gray-400 text-lg leading-relaxed max-w-xl"
            >
              22 comprehensive digital training paths — from complete beginner to market-ready professional.
              Every programme is free, forever.
            </motion.p>

            {/* Stat chips */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { v: '22+', l: 'Skill Tracks' },
                { v: '850+', l: 'Expert Mentors' },
                { v: '45', l: 'Countries' },
                { v: '100%', l: 'Always Free' },
              ].map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.07 }}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
                >
                  <span
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >{s.v}</span>
                  <span className="text-xs text-gray-400">{s.l}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Magnetic>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative px-8 py-4 text-sm font-bold rounded-full overflow-hidden text-white"
                    style={{ background: 'linear-gradient(135deg,#10b981,#14b8a6)' }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start Learning Free
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>→</motion.span>
                    </span>
                  </motion.button>
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => document.getElementById('grid-section').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white/5 transition-all duration-300"
                >
                  Browse Skills ↓
                </motion.button>
              </Magnetic>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-gray-600">scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-5 h-8 border border-gray-700 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 bg-gray-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════ STICKY FILTER TABS ══ */}
      <div
        id="grid-section"
        className="sticky top-[72px] z-30 border-b border-gray-100"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => {
              const isActive = activeTab === cat;
              const accent = cat !== ALL ? catAccent[cat] : null;
              return (
                <motion.button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative whitespace-nowrap px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-2 flex-shrink-0
                    ${isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  {cat !== ALL && accent && (
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${accent.dot}`} />
                  )}
                  {cat}
                  {cat !== ALL && (
                    <span className={`text-[10px] ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                      {services.filter(s => s.category === cat).length}
                    </span>
                  )}
                </motion.button>
              );
            })}

            {/* Count badge */}
            <div className="ml-auto pl-4 flex-shrink-0 border-l border-gray-100 flex items-center gap-2">
              <span className="text-[11px] text-gray-400">
                <span className="font-semibold text-gray-700">{filtered.length}</span> tracks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════ SERVICES GRID ══ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          {/* Section label */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="h-px w-8 bg-emerald-400" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600">
              {activeTab === ALL ? 'All Programmes' : activeTab}
            </span>
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">{filtered.length} available</span>
          </motion.div>

          {/* Grid */}
          <motion.div
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((service, index) => {
                const accent = catAccent[service.category] || catAccent['Career'];
                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -20 }}
                    transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    className={`group relative rounded-3xl border border-gray-100 bg-white overflow-hidden cursor-pointer ${accent.hover} hover:shadow-xl hover:shadow-black/5 transition-all duration-300`}
                  >
                    {/* Hover flood */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at top left,rgba(16,185,129,0.04) 0%,transparent 65%)' }}
                    />
                    {/* Bottom reveal bar */}
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                    <div className="p-7 flex flex-col min-h-[260px]">
                      {/* Top row — icon + category pill */}
                      <div className="flex items-start justify-between mb-5">
                        <motion.div
                          whileHover={{ rotate: 10, scale: 1.12 }}
                          transition={{ duration: 0.25 }}
                          className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-white flex items-center justify-center text-2xl border border-gray-100 group-hover:border-gray-200 shadow-sm transition-all"
                        >
                          {service.icon}
                        </motion.div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${accent.pill} tracking-wide uppercase`}>
                          {service.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-200"
                      >
                        {service.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-500 text-sm leading-relaxed mb-2 flex-1">
                        {service.description}
                      </p>

                      {/* Details — hover reveal */}
                      <p className="text-gray-400 text-xs leading-relaxed max-h-0 overflow-hidden group-hover:max-h-10 transition-all duration-300">
                        {service.details}
                      </p>

                      {/* Footer */}
                      <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${accent.pill}`}>
                          {service.stats}
                        </span>
                        <motion.span
                          whileHover={{ x: 3 }}
                          className="text-xs font-semibold text-gray-400 group-hover:text-emerald-600 transition-colors flex items-center gap-1"
                        >
                          Enroll Free
                          <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.6, repeat: Infinity }}
                          >→</motion.span>
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════ BOTTOM CTA ══ */}
      <section className="py-28 relative overflow-hidden" style={{ background: '#0a0f0a' }}>
        <NoiseOverlay />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-700/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-7"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl mx-auto shadow-2xl shadow-emerald-500/30"
            >
              🚀
            </motion.div>

            <h2
              className="text-5xl md:text-6xl font-bold text-white leading-[0.95]"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Not sure where<br />
              <em
                style={{
                  background: 'linear-gradient(90deg,#34d399,#14b8a6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >to start?</em>
            </h2>

            <p className="text-gray-400 leading-relaxed max-w-md mx-auto text-base">
              Take our free 2-minute skill assessment and get a personalised learning path built for your exact goals.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Magnetic>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-9 py-4 bg-white text-gray-900 text-sm font-bold rounded-full hover:bg-emerald-50 transition-colors duration-300 flex items-center gap-2 shadow-2xl shadow-black/30"
                  >
                    Start Free Assessment
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                  </motion.button>
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link to="/how-it-works">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-9 py-4 border border-white/20 text-white text-sm font-semibold rounded-full hover:bg-white/5 transition-all duration-300"
                  >
                    How It Works
                  </motion.button>
                </Link>
              </Magnetic>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {['🎓 Free Forever', '🌍 45 Countries', '⚡ Start in Minutes', '💬 Live Support'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="px-4 py-2 bg-white/5 rounded-full border border-white/8 text-xs text-gray-400 font-medium"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}