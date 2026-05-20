// frontend/src/pages/Services.jsx
// Exact same design system & hero color as Home.jsx — #f8faf8 light background
// Deps: framer-motion (already installed)
// Fonts: Instrument Serif + DM Sans (in index.html)

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';

// ─────────────────────────────────────────────────────────────────────────────
// NOISE OVERLAY — same helper as Home
// ─────────────────────────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] mix-blend-overlay"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="noise-srv">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-srv)" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGNETIC BUTTON — same helper as Home
// ─────────────────────────────────────────────────────────────────────────────
function Magnetic({ children, strength = 0.45 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });
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

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR BLOB — same helper as Home
// ─────────────────────────────────────────────────────────────────────────────
function CursorBlob() {
  const blobRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => { target.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', move);
    let frame;
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.08;
      pos.current.y += (target.current.y - pos.current.y) * 0.08;
      if (blobRef.current) {
        blobRef.current.style.transform = `translate(${pos.current.x - 250}px,${pos.current.y - 250}px)`;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(frame); };
  }, []);

  return (
    <div
      ref={blobRef}
      className="fixed top-0 left-0 w-[500px] h-[500px] pointer-events-none z-0"
      style={{ willChange: 'transform' }}
    >
      <div className="w-full h-full rounded-full bg-emerald-400/6 blur-[80px]" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const ALL = 'All';
const CATEGORIES = [ALL, 'Development', 'Design', 'Marketing', 'Data', 'Security', 'Career'];

const catAccent = {
  Development: {
    pill:  'bg-blue-50 text-blue-700',
    dot:   'bg-blue-400',
    bar:   'from-blue-400 to-cyan-400',
    glow:  'group-hover:shadow-blue-100',
  },
  Design: {
    pill:  'bg-purple-50 text-purple-700',
    dot:   'bg-purple-400',
    bar:   'from-purple-400 to-pink-400',
    glow:  'group-hover:shadow-purple-100',
  },
  Marketing: {
    pill:  'bg-orange-50 text-orange-700',
    dot:   'bg-orange-400',
    bar:   'from-orange-400 to-red-400',
    glow:  'group-hover:shadow-orange-100',
  },
  Data: {
    pill:  'bg-emerald-50 text-emerald-700',
    dot:   'bg-emerald-400',
    bar:   'from-emerald-400 to-teal-400',
    glow:  'group-hover:shadow-emerald-100',
  },
  Security: {
    pill:  'bg-rose-50 text-rose-700',
    dot:   'bg-rose-400',
    bar:   'from-rose-400 to-red-500',
    glow:  'group-hover:shadow-rose-100',
  },
  Career: {
    pill:  'bg-teal-50 text-teal-700',
    dot:   'bg-teal-400',
    bar:   'from-teal-400 to-cyan-500',
    glow:  'group-hover:shadow-teal-100',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED NUMBER COUNTER (viewport triggered)
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !ran) {
        setRan(true);
        const dur = 2000;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 4)) * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, ran]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Services() {
  const [activeTab, setActiveTab] = useState(ALL);
  const heroRef  = useRef(null);
  const filterRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const heroScale   = useTransform(scrollYProgress, [0, 0.55], [1, 0.96]);

  const filtered = useMemo(
    () => activeTab === ALL ? services : services.filter((s) => s.category === activeTab),
    [activeTab],
  );

  return (
    <div className="bg-[#f8faf8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <CursorBlob />

      {/* ═══════════════════════════════════════════════════════ HERO ══ */}
      {/*   bg-[#f8faf8] + emerald grid + concentric rings = exact Home match  */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center overflow-hidden bg-[#f8faf8] pt-24"
      >
        <NoiseOverlay />

        {/* Emerald grid — pixel-perfect match with Home hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Mouse-follow radial gradient — same as Home */}
        <MouseGradient />

        {/* Architectural concentric rings — right side, same as Home */}
        <motion.div
          style={{ y: heroY }}
          className="absolute -right-40 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-emerald-200/60 pointer-events-none"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 80]) }}
          className="absolute -right-64 top-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-emerald-100/40 pointer-events-none"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 40]) }}
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-50/80 pointer-events-none"
        />

        {/* Spinning ring badge — same as Home */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute top-36 right-24 hidden xl:block"
        >
          <motion.div
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-28 h-28 flex items-center justify-center"
          >
            <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 112 112">
              <path id="srv-ring" d="M 56,56 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
              <text fontSize="10" fontFamily="DM Sans, sans-serif" fill="#059669" fontWeight="500" letterSpacing="3">
                <textPath href="#srv-ring">22 SKILLS • ALL FREE • 22 SKILLS • ALL FREE • </textPath>
              </text>
            </svg>
            <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <span className="text-white text-xl">✦</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating stat card bottom-left — same pattern as Home */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-36 left-8 hidden xl:block"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-4 w-52"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-base">🎓</div>
              <div>
                <div className="text-xs text-gray-400 font-medium">This month</div>
                <div className="text-sm font-semibold text-gray-800">420+ enrolled</div>
              </div>
            </div>
            <div className="flex gap-1">
              {[70, 85, 60, 95, 75, 90, 100].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 2.4 + i * 0.07, duration: 0.4 }}
                  style={{ height: `${h * 0.28}px`, originY: 1 }}
                  className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-sm"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Hero content ── */}
        <motion.div
          style={{ y: heroY }}
          className="relative z-10 max-w-7xl mx-auto px-6 w-full"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT */}
            <div className="space-y-8">

              {/* Eyebrow badge — same as Home */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200 shadow-lg"
              >
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative flex h-2.5 w-2.5"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </motion.span>
                <span className="text-sm font-semibold text-emerald-700">22 Free Skill Tracks</span>
              </motion.div>

              {/* Headline — same serif + gradient style as Home */}
              <div className="space-y-1 overflow-hidden">
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="leading-[0.95] tracking-tight text-gray-900"
                  style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: 'clamp(3rem, 6.5vw, 6rem)',
                    fontWeight: 700,
                  }}
                >
                  Skills That
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="leading-[0.95] tracking-tight italic"
                  style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: 'clamp(3rem, 6.5vw, 6rem)',
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #10b981, #14b8a6, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Open Doors
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.54, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="leading-[0.95] tracking-tight text-gray-900"
                  style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: 'clamp(3rem, 6.5vw, 6rem)',
                    fontWeight: 700,
                  }}
                >
                  For Free
                </motion.h1>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.8 }}
                className="text-gray-500 text-lg leading-relaxed max-w-lg"
              >
                22 comprehensive digital training paths built for people in Gaza —
                from complete beginner to market-ready professional, at zero cost.
              </motion.p>

              {/* CTA row — same buttons as Home */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.78, duration: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <Magnetic>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(16,185,129,0.35)' }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative px-8 py-4 text-white font-bold rounded-full shadow-xl shadow-emerald-500/25 overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
                    >
                      <span className="relative z-10 flex items-center gap-2 text-sm">
                        Start Learning Free
                        <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                          →
                        </motion.span>
                      </span>
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                  </Link>
                </Magnetic>

                <Magnetic strength={0.3}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => filterRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:border-emerald-400 hover:text-emerald-600 transition-all duration-300 text-sm"
                  >
                    Browse All Skills ↓
                  </motion.button>
                </Magnetic>
              </motion.div>

              {/* Quick stat row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="flex flex-wrap gap-6 pt-2"
              >
                {[
                  { v: 22, suffix: '+', l: 'Skill tracks' },
                  { v: 850, suffix: '+', l: 'Expert mentors' },
                  { v: 45, suffix: '', l: 'Countries' },
                ].map((s) => (
                  <div key={s.l} className="flex items-center gap-2">
                    <span
                      className="text-2xl font-bold text-gray-900"
                      style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                    >
                      <AnimatedNumber value={s.v} suffix={s.suffix} />
                    </span>
                    <span className="text-sm text-gray-500">{s.l}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — category preview card stack */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:flex items-center justify-center h-[540px]"
            >
              {/* Background tilt cards */}
              <motion.div
                animate={{ rotate: [-5, -3, -5] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-72 h-[420px] bg-teal-100/60 rounded-3xl border border-teal-200/60"
              />
              <motion.div
                animate={{ rotate: [3, 5, 3] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute w-72 h-[420px] bg-emerald-100/60 rounded-3xl border border-emerald-200/60"
              />

              {/* Main card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-72 bg-white rounded-3xl shadow-2xl shadow-emerald-900/10 border border-gray-100 p-7 flex flex-col gap-4"
              >
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-400/30">
                    <span className="text-white text-lg">📚</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full tracking-wide uppercase">
                    22 Tracks
                  </span>
                </div>

                {/* Category list */}
                <div className="space-y-2">
                  {CATEGORIES.slice(1).map((cat, i) => {
                    const a = catAccent[cat];
                    const count = services.filter(s => s.category === cat).length;
                    return (
                      <motion.div
                        key={cat}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.2 + i * 0.1 }}
                        className="flex items-center justify-between bg-gray-50/80 rounded-xl px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
                          <span className="text-xs font-semibold text-gray-700">{cat}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.pill}`}>
                          {count} tracks
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Bottom chip */}
                <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2.5 text-xs text-gray-500 mt-1">
                  <span className="text-emerald-500">✦</span>
                  <span>All tracks <strong className="text-emerald-600">100% free</strong></span>
                </div>
              </motion.div>

              {/* Floating chip top-right */}
              <motion.div
                animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-4 right-0 bg-white shadow-xl shadow-black/8 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 z-20"
              >
                <span className="text-base">🌍</span>
                <div>
                  <div className="text-xs font-semibold text-gray-800">45 Countries</div>
                  <div className="text-[10px] text-gray-400">Mentors active</div>
                </div>
              </motion.div>

              {/* Floating chip bottom-left */}
              <motion.div
                animate={{ y: [0, 10, 0], x: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute bottom-6 left-0 bg-white shadow-xl shadow-black/8 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 z-20"
              >
                <span className="text-base">🏆</span>
                <div>
                  <div className="text-xs font-semibold text-gray-800">3,200+ Graduates</div>
                  <div className="text-[10px] text-gray-400">hired globally</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400">scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-5 h-8 border border-gray-300 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 bg-gray-400 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════ MARQUEE STRIP (same as Home) ══ */}
      <div className="relative bg-gray-900 py-4 overflow-hidden border-y border-gray-800">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-8 whitespace-nowrap"
        >
          {[...CATEGORIES.slice(1), ...CATEGORIES.slice(1)].map((cat, i) => {
            const icon = {
              Development: '💻', Design: '🎨', Marketing: '📣',
              Data: '📊', Security: '🔐', Career: '🚀',
            }[cat];
            const doubled = [icon, cat, icon, cat];
            return doubled.map((item, j) => (
              <span
                key={`${i}-${j}`}
                className={`text-sm font-medium tracking-wide ${j % 2 === 0 ? 'text-emerald-400' : 'text-gray-400'}`}
              >
                {item}
              </span>
            ));
          })}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════ STICKY FILTER BAR ══ */}
      <div
        ref={filterRef}
        className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-hide">

            {CATEGORIES.map((cat) => {
              const isActive = activeTab === cat;
              const accent = cat !== ALL ? catAccent[cat] : null;
              const count = cat === ALL ? services.length : services.filter(s => s.category === cat).length;

              return (
                <motion.button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                  className={`relative whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex-shrink-0
                    ${isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent hover:border-gray-100'
                    }`}
                >
                  {accent && (
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${accent.dot} ${isActive ? 'opacity-60' : ''}`} />
                  )}
                  {cat}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {count}
                  </span>
                </motion.button>
              );
            })}

            <div className="ml-auto pl-4 flex-shrink-0 border-l border-gray-100 flex items-center gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeTab}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] text-gray-400 whitespace-nowrap"
                >
                  <span className="font-semibold text-gray-700">{filtered.length}</span> tracks
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════ SERVICES GRID ══ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          {/* Section label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + '-label'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4 mb-12"
            >
              <div className="h-px w-8 bg-emerald-400" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600">
                {activeTab === ALL ? 'All Programmes' : activeTab}
              </span>
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-400">{filtered.length} available</span>
            </motion.div>
          </AnimatePresence>

          {/* Grid with layout animation */}
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((service, index) => {
                const accent = catAccent[service.category] || catAccent['Career'];
                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{
                      duration: 0.38,
                      delay: index * 0.035,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`group relative rounded-3xl border border-gray-100 bg-white overflow-hidden cursor-pointer
                      hover:shadow-xl hover:shadow-black/5 transition-all duration-300 ${accent.glow}`}
                  >
                    {/* Hover flood */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at top left,rgba(16,185,129,0.04) 0%,transparent 65%)' }}
                    />
                    {/* Bottom bar reveal */}
                    <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${accent.bar} origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />

                    <div className="p-7 flex flex-col min-h-[270px]">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-5">
                        <motion.div
                          whileHover={{ rotate: 10, scale: 1.12 }}
                          transition={{ duration: 0.25 }}
                          className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-white flex items-center justify-center text-2xl border border-gray-100 group-hover:border-gray-200 shadow-sm transition-all"
                        >
                          {service.icon}
                        </motion.div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${accent.pill} tracking-wide`}>
                          {service.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-200">
                        {service.title}
                      </h3>

                      <p className="text-gray-500 text-sm leading-relaxed flex-1">
                        {service.description}
                      </p>

                      {/* Detail — smooth height reveal */}
                      <motion.p
                        initial={false}
                        className="text-gray-400 text-xs leading-relaxed overflow-hidden"
                        style={{ maxHeight: 0 }}
                        whileHover={{ maxHeight: 40 }}
                        transition={{ duration: 0.3 }}
                      >
                        {service.details}
                      </motion.p>

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
                          <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
                            →
                          </motion.span>
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

      {/* ═══════════════════════════════════ BOTTOM CTA — matches Home FinalCTA ══ */}
      <section className="relative py-32 overflow-hidden">
        {/* Same gradient as Home FinalCTA */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />

        {/* Animated waves — same as Home */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/2 -right-1/4 w-[150%] h-[200%] bg-white/5 rounded-full blur-3xl"
          />
        </div>
        <NoiseOverlay />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">
                Start Today — Zero Cost
              </span>
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Not sure where<br />
              <span className="relative">
                to start?
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full h-5"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 1 }}
                >
                  <path d="M0 12 Q 60 0 120 10 Q 180 20 240 10 Q 300 0 360 12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
                </motion.svg>
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="text-white/80 text-lg max-w-xl mx-auto leading-relaxed"
            >
              Take our free 2-minute skill assessment and get a personalised learning
              path built for your exact goals and experience level.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 pt-2"
            >
              <Magnetic>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 bg-white text-emerald-700 font-bold rounded-full shadow-2xl text-base hover:shadow-3xl transition-all duration-300 flex items-center gap-2"
                  >
                    Get Started Free
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                  </motion.button>
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 border-2 border-white/40 text-white font-bold rounded-full text-base transition-all duration-300"
                  >
                    Become a Volunteer
                  </motion.button>
                </Link>
              </Magnetic>
            </motion.div>

            {/* Feature pills — same as Home FinalCTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-6 pt-4 text-white/70"
            >
              {[
                { icon: '🎓', label: 'Free Forever' },
                { icon: '💬', label: 'Live Support' },
                { icon: '🚀', label: 'Job-Ready Skills' },
                { icon: '🌍', label: 'Global Mentors' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ── Mouse gradient helper (inside file to avoid prop drilling) ────────────────
function MouseGradient() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  return (
    <div
      className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
      style={{
        backgroundImage: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(16,185,129,0.1) 0%, transparent 50%)`,
      }}
    />
  );
}