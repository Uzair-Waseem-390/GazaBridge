// frontend/src/pages/HowItWorks.jsx
// Design system: Instrument Serif + DM Sans — exact match to Home.jsx hero
// Deps: framer-motion (already installed)

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// ─── Noise overlay ────────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise-hiw">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-hiw)" />
    </svg>
  );
}

// ─── Mouse gradient (same as Home) ────────────────────────────────────────────
function MouseGradient() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <div
      className="absolute inset-0 opacity-30 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(16,185,129,0.1) 0%, transparent 50%)`,
      }}
    />
  );
}

// ─── Cursor blob (same as Home) ───────────────────────────────────────────────
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
      if (blobRef.current)
        blobRef.current.style.transform = `translate(${pos.current.x - 250}px,${pos.current.y - 250}px)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(frame); };
  }, []);
  return (
    <div ref={blobRef} className="fixed top-0 left-0 w-[500px] h-[500px] pointer-events-none z-0" style={{ willChange: 'transform' }}>
      <div className="w-full h-full rounded-full bg-emerald-400/6 blur-[80px]" />
    </div>
  );
}

// ─── Magnetic wrapper ─────────────────────────────────────────────────────────
function Magnetic({ children, strength = 0.45 }) {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
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

// ─── Data ─────────────────────────────────────────────────────────────────────
const volunteerSteps = [
  { number: '01', title: 'Create a Free Account',   description: 'Sign up using Google or email in under 60 seconds. No card, no commitment.',           icon: '👤' },
  { number: '02', title: 'Complete Your Profile',   description: 'Add your skills, languages, availability, and optionally your LinkedIn and WhatsApp.',  icon: '📝' },
  { number: '03', title: 'Post an Offer',           description: 'Describe what you can teach or help with — coding, English, CV review, design, etc.',   icon: '📢' },
  { number: '04', title: 'Browse Needs',            description: 'Find people in Gaza who need your skills and message them directly.',                    icon: '🔍' },
  { number: '05', title: 'Connect & Teach',         description: 'Connect via platform messages, WhatsApp chat, or invite them to your group.',           icon: '💬' },
];

const seekerSteps = [
  { number: '01', title: 'Create a Free Account',   description: 'Sign up using Google or email in under 60 seconds. Completely free.',                   icon: '👤' },
  { number: '02', title: 'Complete Your Profile',   description: 'Add your location, languages, and contact info (WhatsApp or Telegram).',                icon: '📝' },
  { number: '03', title: 'Post a Request',          description: 'Describe what help you need — "I want to learn English" or "I need CV help".',          icon: '📢' },
  { number: '04', title: 'Browse Volunteers',       description: 'Find someone with the skills you need and message them directly.',                       icon: '🔍' },
  { number: '05', title: 'Learn for Free',          description: 'Everything is completely free — volunteers are here to help at zero cost to you.',      icon: '🎓' },
];

const volunteerWhy = [
  'Make a real difference in someone\'s life',
  'Share your expertise with eager learners',
  'Build meaningful cross-cultural connections',
  'Teach flexibly on your own schedule',
];

const seekerWhy = [
  '100% free — no hidden costs, ever',
  'Learn from experienced global professionals',
  'Flexible learning at your own pace',
  'Build skills that lead to real, paying jobs',
];

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ step, index, accentBar }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.09, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 6 }}
      className="group relative flex items-start gap-5 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Bottom reveal bar */}
      <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${accentBar} origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />

      {/* Step number */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ duration: 0.25 }}
          className="w-11 h-11 rounded-2xl bg-gray-50 group-hover:bg-emerald-50 border border-gray-100 group-hover:border-emerald-200 flex items-center justify-center text-xl transition-all duration-300 shadow-sm"
        >
          {step.icon}
        </motion.div>
        <span className="text-[10px] font-bold text-gray-300 font-mono">{step.number}</span>
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors duration-200">
          {step.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}

// ─── Why card ─────────────────────────────────────────────────────────────────
function WhyCard({ emoji, title, points, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      animate={{ y: [0, -8, 0] }}
      // animate prop intentionally overrides whileInView after mount — use separate motion.div for float
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-black/5 p-8"
      >
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 w-full h-1 rounded-t-3xl bg-gradient-to-r ${gradient}`} />

        <div className="text-4xl mb-4">{emoji}</div>
        <h3
          className="text-xl font-bold text-gray-900 mb-5"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >{title}</h3>

        <ul className="space-y-3">
          {points.map((p, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-start gap-3 text-sm text-gray-600"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 text-[10px] mt-0.5 font-bold">✓</span>
              {p}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function HowItWorks() {
  const [activeRole, setActiveRole] = useState('volunteer');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const heroScale   = useTransform(scrollYProgress, [0, 0.55], [1, 0.96]);

  const isVolunteer = activeRole === 'volunteer';
  const steps       = isVolunteer ? volunteerSteps : seekerSteps;
  const whyPoints   = isVolunteer ? volunteerWhy : seekerWhy;

  // Scroll-driven progress line for steps
  const stepsRef = useRef(null);
  const { scrollYProgress: stepsScroll } = useScroll({ target: stepsRef, offset: ['start end', 'end start'] });
  const lineH = useTransform(stepsScroll, [0.1, 0.85], ['0%', '100%']);

  return (
    <div className="bg-[#f8faf8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <CursorBlob />

      {/* ══════════════════════════════════════════════ HERO ══ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center overflow-hidden bg-[#f8faf8] pt-24"
      >
        <NoiseOverlay />
        <MouseGradient />

        {/* Emerald grid — identical to Home */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />

        {/* Architectural rings — right side, same as Home */}
        <motion.div style={{ y: heroY }}
          className="absolute -right-40 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-emerald-200/60 pointer-events-none" />
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 80]) }}
          className="absolute -right-64 top-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-emerald-100/40 pointer-events-none" />
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 40]) }}
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-50/80 pointer-events-none" />

        {/* Spinning badge — same as Home */}
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
              <path id="ring-hiw" d="M 56,56 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
              <text fontSize="10" fontFamily="DM Sans, sans-serif" fill="#059669" fontWeight="500" letterSpacing="3">
                <textPath href="#ring-hiw">5 SIMPLE STEPS • FREE FOREVER • </textPath>
              </text>
            </svg>
            <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <span className="text-white text-xl">✦</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating card — bottom left, same as Home */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-36 left-8 hidden xl:block"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-4 w-54"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-base">🤝</div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Live right now</div>
                <div className="text-sm font-semibold text-gray-800">238 active sessions</div>
              </div>
            </div>
            <div className="flex gap-1">
              {[60, 80, 55, 90, 70, 85, 95].map((h, i) => (
                <motion.div key={i}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                  transition={{ delay: 2.4 + i * 0.07, duration: 0.4 }}
                  style={{ height: `${h * 0.28}px`, originY: 1 }}
                  className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-sm"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Hero content */}
        <motion.div style={{ y: heroY }} className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl space-y-8">

            {/* Eyebrow — same as Home */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200 shadow-lg"
            >
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </motion.span>
              <span className="text-sm font-semibold text-emerald-700">Simple 5-Step Process</span>
            </motion.div>

            {/* Headline — serif, same as Home */}
            <div className="space-y-1 overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-gray-900 leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 700 }}
              >
                How
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="italic leading-[0.95] tracking-tight"
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 700,
                  background: 'linear-gradient(90deg,#10b981,#14b8a6,#06b6d4)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}
              >
                GazaBridge
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-gray-900 leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 700 }}
              >
                Works
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.8 }}
              className="text-gray-500 text-lg leading-relaxed max-w-lg"
            >
              A free platform connecting skilled volunteers worldwide with talented people
              in Gaza who need digital skills support — in just five steps.
            </motion.p>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <Magnetic>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(16,185,129,0.35)' }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-8 py-4 text-white font-bold rounded-full shadow-xl shadow-emerald-500/25 overflow-hidden text-sm"
                    style={{ background: 'linear-gradient(135deg,#10b981,#14b8a6)' }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Join as Volunteer
                      <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                    </span>
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:border-emerald-400 hover:text-emerald-600 transition-all duration-300 text-sm"
                  >
                    Start Learning Free
                  </motion.button>
                </Link>
              </Magnetic>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex items-center gap-4 pt-2"
            >
              <div className="flex -space-x-2">
                {['A', 'M', 'S', 'K', 'R'].map((l, i) => (
                  <motion.div key={l}
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2 + i * 0.07 }}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
                    style={{ background: `hsl(${155 + i * 14},60%,${40 + i * 3}%)` }}
                  >{l}</motion.div>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">5,000+</span> learners connected
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400">scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
            className="w-5 h-8 border border-gray-300 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 bg-gray-400 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ══════════════════════════════════════════════ MARQUEE ══ */}
      <div className="relative bg-gray-900 py-4 overflow-hidden border-y border-gray-800">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-8 whitespace-nowrap"
        >
          {[...Array(2)].flatMap(() => [
            'Create Account', '✦', 'Complete Profile', '✦', 'Post an Offer',
            '✦', 'Browse Needs', '✦', 'Connect & Teach', '✦', 'Learn for Free', '✦',
          ]).map((item, i) => (
            <span key={i} className={`text-sm font-medium tracking-wide ${item === '✦' ? 'text-emerald-400' : 'text-gray-400'}`}>
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════ ROLE TOGGLE ══ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="flex flex-col items-center mb-16 gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-emerald-400" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600">The Process</span>
              <div className="h-px w-8 bg-emerald-400" />
            </div>

            <h2
              className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05] text-center"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Pick Your Path
            </h2>

            {/* Toggle pill */}
            <div className="flex items-center bg-gray-100 rounded-full p-1.5 gap-1">
              {[
                { id: 'volunteer', label: '🙌 I want to volunteer', },
                { id: 'seeker',    label: '🎓 I want to learn', },
              ].map((opt) => (
                <motion.button
                  key={opt.id}
                  onClick={() => setActiveRole(opt.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative px-6 py-3 rounded-full text-sm font-bold transition-all duration-300
                    ${activeRole === opt.id ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Two column layout: steps + why card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid lg:grid-cols-[1.6fr_1fr] gap-12 items-start"
            >
              {/* Left — scroll-driven timeline */}
              <div ref={stepsRef} className="relative">
                {/* Vertical line */}
                <div className="absolute left-[26px] top-6 bottom-6 w-px bg-gray-100">
                  <motion.div style={{ height: lineH }} className="w-full bg-gradient-to-b from-emerald-400 to-teal-500 origin-top" />
                </div>

                <div className="space-y-4 pl-2">
                  {steps.map((step, i) => (
                    <StepCard
                      key={step.number + activeRole}
                      step={step}
                      index={i}
                      accentBar={isVolunteer ? 'from-emerald-400 to-teal-500' : 'from-teal-400 to-cyan-500'}
                    />
                  ))}
                </div>
              </div>

              {/* Right — sticky why card */}
              <div className="lg:sticky lg:top-32">
                <WhyCard
                  emoji={isVolunteer ? '🌟' : '🎓'}
                  title={isVolunteer ? 'Why Volunteer?' : 'Why Learn With Us?'}
                  points={whyPoints}
                  gradient={isVolunteer ? 'from-emerald-400 to-teal-500' : 'from-teal-400 to-cyan-500'}
                />

                {/* CTA under why card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 space-y-3"
                >
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="w-full py-4 rounded-2xl font-bold text-white text-sm shadow-lg shadow-emerald-500/20 transition-all"
                      style={{ background: 'linear-gradient(135deg,#10b981,#14b8a6)' }}
                    >
                      {isVolunteer ? 'Join as Volunteer →' : 'Start Learning Free →'}
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveRole(isVolunteer ? 'seeker' : 'volunteer')}
                    className="w-full py-3 rounded-2xl font-semibold text-gray-500 text-sm border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                  >
                    {isVolunteer ? 'Or learn instead →' : 'Or volunteer instead →'}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ STATS BAND ══ */}
      <section className="py-16 bg-[#f8faf8] overflow-hidden">
        <NoiseOverlay />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 rounded-3xl overflow-hidden border border-gray-200">
            {[
              { v: '5,000+', l: 'Active Learners',    icon: '🎓' },
              { v: '850+',   l: 'Expert Volunteers',  icon: '🙌' },
              { v: '45',     l: 'Countries Reached',  icon: '🌍' },
              { v: '3,200+', l: 'Success Stories',    icon: '🏆' },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white px-8 py-8 group hover:bg-emerald-50/40 transition-colors duration-300"
              >
                <div className="text-2xl mb-3">{s.icon}</div>
                <div
                  className="text-4xl font-bold text-gray-900 mb-1"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >{s.v}</div>
                <div className="text-xs text-gray-500 font-medium">{s.l}</div>
                <motion.div
                  className="mt-4 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ FINAL CTA ══ */}
      {/* Exact same gradient as Home FinalCTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
        <div className="absolute inset-0 overflow-hidden">
          <motion.div animate={{ x: [0, -50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-white/5 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, 50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/2 -right-1/4 w-[150%] h-[200%] bg-white/5 rounded-full blur-3xl" />
        </div>
        <NoiseOverlay />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">Ready in 60 seconds</span>
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Ready to Start<br />
              <span className="relative">
                Your Journey?
                <motion.svg className="absolute -bottom-2 left-0 w-full h-5"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ delay: 0.8, duration: 1 }}>
                  <path d="M0 12 Q 60 0 120 10 Q 180 20 240 10 Q 300 0 360 12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
                </motion.svg>
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.35 }}
              className="text-white/80 text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Join thousands of learners and volunteers making a real difference.
              Start today — completely free, forever.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 pt-2"
            >
              <Magnetic>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 bg-white text-emerald-700 font-bold rounded-full shadow-2xl text-base hover:bg-emerald-50 transition-colors duration-300 flex items-center gap-2"
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

            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-8 pt-4 text-white/70"
            >
              {[
                { icon: '🎓', label: 'Free Forever' },
                { icon: '💬', label: 'Live Support' },
                { icon: '🚀', label: 'Job-Ready Skills' },
                { icon: '🌍', label: 'Global Community' },
              ].map(item => (
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