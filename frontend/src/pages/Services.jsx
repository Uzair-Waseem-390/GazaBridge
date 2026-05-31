// frontend/src/pages/HowItWorks.jsx
// Design system: Instrument Serif + DM Sans — Olive & Cream Theme

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
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise-hiw">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-hiw)" />
    </svg>
  );
}

// ─── Mouse gradient ───────────────────────────────────────────────────────────
function MouseGradient() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <div
      className="absolute inset-0 opacity-25 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(128,128,0,0.08) 0%, transparent 50%)`,
      }}
    />
  );
}

// ─── Cursor blob ────────────────────────────────────────────────────────
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
      <div className="w-full h-full rounded-full bg-[#808000]/5 blur-[80px]" />
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
      className="group relative flex items-start gap-5 bg-white rounded-2xl border border-[#808000]/10 p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${accentBar} origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />

      <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ duration: 0.25 }}
          className="w-11 h-11 rounded-2xl bg-[#808000]/5 border border-[#808000]/20 group-hover:border-[#808000]/40 flex items-center justify-center text-xl transition-all duration-300 shadow-sm"
        >
          {step.icon}
        </motion.div>
        <span className="text-[10px] font-bold text-gray-300 font-mono">{step.number}</span>
      </div>

      <div className="flex-1 pt-0.5">
        <h3 className="text-base font-bold text-[#111100] mb-1 group-hover:text-[#808000] transition-colors duration-200">
          {step.title}
        </h3>
        <p className="text-[#555500] text-sm leading-relaxed">{step.description}</p>
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
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="bg-white rounded-3xl border border-[#808000]/10 shadow-xl shadow-black/5 p-8"
      >
        <div className={`absolute top-0 left-0 w-full h-1 rounded-t-3xl bg-gradient-to-r ${gradient}`} />

        <div className="text-4xl mb-4">{emoji}</div>
        <h3 className="text-xl font-bold text-[#111100] mb-5" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
          {title}
        </h3>

        <ul className="space-y-3">
          {points.map((p, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-start gap-3 text-sm text-[#555500]"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#808000]/10 border border-[#808000]/30 flex items-center justify-center text-[#808000] text-[10px] mt-0.5 font-bold">✓</span>
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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.96]);

  const isVolunteer = activeRole === 'volunteer';
  const steps = isVolunteer ? volunteerSteps : seekerSteps;
  const whyPoints = isVolunteer ? volunteerWhy : seekerWhy;

  const stepsRef = useRef(null);
  const { scrollYProgress: stepsScroll } = useScroll({ target: stepsRef, offset: ['start end', 'end start'] });
  const lineH = useTransform(stepsScroll, [0.1, 0.85], ['0%', '100%']);

  return (
    <div className="bg-[#F5F0E6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <CursorBlob />

      {/* ══════════════════════════════════════════════ HERO ══ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center overflow-hidden bg-[#F5F0E6] pt-20 md:pt-24"
      >
        <NoiseOverlay />
        <MouseGradient />

        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(128,128,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128,128,0,0.04) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />

        <motion.div style={{ y: heroY }}
          className="absolute -right-40 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#808000]/15 pointer-events-none" />
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 80]) }}
          className="absolute -right-64 top-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#808000]/8 pointer-events-none" />
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 40]) }}
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#808000]/4 pointer-events-none" />

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
              <text fontSize="10" fontFamily="DM Sans, sans-serif" fill="#808000" fontWeight="500" letterSpacing="3">
                <textPath href="#ring-hiw">5 SIMPLE STEPS • FREE FOREVER • </textPath>
              </text>
            </svg>
            <div className="w-14 h-14 rounded-full bg-[#808000] flex items-center justify-center shadow-lg shadow-[#808000]/20">
              <span className="text-white text-xl">✦</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: heroY }} className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full">
          <div className="max-w-2xl space-y-8">

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#808000]/30 shadow-lg"
            >
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#808000]/40 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#808000]" />
              </motion.span>
              <span className="text-sm font-semibold text-[#808000]">Simple 5-Step Process</span>
            </motion.div>

            <div className="space-y-1 overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-5xl lg:text-7xl text-[#111100] leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 700 }}
              >
                How
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-5xl lg:text-7xl italic leading-[0.95] tracking-tight"
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontWeight: 700,
                  background: 'linear-gradient(90deg,#808000,#6b6b00,#555500)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}
              >
                GazaBridge
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-5xl lg:text-7xl text-[#111100] leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 700 }}
              >
                Works
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.8 }}
              className="text-[#555500] text-lg leading-relaxed max-w-lg"
            >
              A free platform connecting skilled volunteers worldwide with talented people
              in Gaza who need digital skills support — in just five steps.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto"
            >
              <Magnetic>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(128,128,0,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-8 py-4 text-white font-bold rounded-full shadow-xl shadow-[#808000]/25 overflow-hidden text-sm"
                    style={{ background: 'linear-gradient(135deg,#808000,#6b6b00)' }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Join as Volunteer
                      <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                    </span>
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-[#555500] to-[#333300] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-[#808000]/30 text-[#808000] font-bold rounded-full hover:border-[#808000] hover:text-[#808000] transition-all duration-300 text-sm"
                  >
                    Start Learning Free
                  </motion.button>
                </Link>
              </Magnetic>
            </motion.div>

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
                    style={{ background: `hsl(${50 + i * 10},50%,${30 + i * 4}%)` }}
                  >{l}</motion.div>
                ))}
              </div>
              <span className="text-sm text-[#555500]">
                <span className="font-semibold text-[#111100]">5,000+</span> learners connected
              </span>
            </motion.div>
          </div>
        </motion.div>

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
      <div 
        className="relative py-4 overflow-hidden border-y z-10 backdrop-blur-sm"
        style={{ 
          backgroundColor: 'rgba(252, 236, 222, 0.6)', 
          borderColor: 'rgba(128, 128, 0, 0.15)' 
        }}
      >
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-8 whitespace-nowrap"
        >
          {[...Array(2)].flatMap(() => [
            'Create Account', '✦', 'Complete Profile', '✦', 'Post an Offer',
            '✦', 'Browse Needs', '✦', 'Connect & Teach', '✦', 'Learn for Free', '✦',
          ]).map((item, i) => (
            <span
              key={i}
              className="text-sm font-bold tracking-wide"
              style={{ 
                fontFamily: "'DM Sans', sans-serif",
                color: item === '✦' ? '#808000' : '#111111' 
              }}
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════ ROLE TOGGLE ══ */}
      <section className="py-10 md:py-20 bg-[#F5F0E6]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="flex flex-col items-center mb-16 gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-[#808000]" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#808000]">The Process</span>
              <div className="h-px w-8 bg-[#808000]" />
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-[#111100] leading-[1.05] text-center" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Pick Your Path
            </h2>

            <div className="flex items-center bg-white rounded-full p-1.5 gap-1">
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
                    ${activeRole === opt.id ? 'bg-[#808000] text-white shadow-md' : 'text-[#555500] hover:text-[#808000]'}`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-12 items-start"
            >
              <div ref={stepsRef} className="relative">
                <div className="absolute left-[26px] top-6 bottom-6 w-px bg-gray-100">
                  <motion.div style={{ height: lineH }} className="w-full bg-gradient-to-b from-[#808000] to-[#6b6b00] origin-top" />
                </div>

                <div className="space-y-4 pl-2">
                  {steps.map((step, i) => (
                    <StepCard
                      key={step.number + activeRole}
                      step={step}
                      index={i}
                      accentBar={isVolunteer ? 'from-[#808000] to-[#6b6b00]' : 'from-[#6b6b00] to-[#555500]'}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:sticky lg:top-32">
                <WhyCard
                  emoji={isVolunteer ? '🌟' : '🎓'}
                  title={isVolunteer ? 'Why Volunteer?' : 'Why Learn With Us?'}
                  points={whyPoints}
                  gradient={isVolunteer ? 'from-[#808000] to-[#6b6b00]' : 'from-[#6b6b00] to-[#555500]'}
                />

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
                      className="w-full py-4 rounded-2xl font-bold text-white text-sm shadow-lg shadow-[#808000]/20 transition-all"
                      style={{ background: 'linear-gradient(135deg,#808000,#6b6b00)' }}
                    >
                      {isVolunteer ? 'Join as Volunteer →' : 'Start Learning Free →'}
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveRole(isVolunteer ? 'seeker' : 'volunteer')}
                    className="w-full py-3 rounded-2xl font-semibold text-[#555500] text-sm border border-[#808000]/20 hover:border-[#808000]/40 hover:text-[#808000] transition-all"
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
      <section className="py-10 md:py-16 bg-[#F5F0E6] overflow-hidden">
        <NoiseOverlay />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#808000]/10 rounded-3xl overflow-hidden border border-[#808000]/10">
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
                className="bg-white px-8 py-8 group hover:bg-[#808000]/5 transition-colors duration-300"
              >
                <div className="text-2xl mb-3">{s.icon}</div>
                <div className="text-4xl font-bold text-[#111100] mb-1" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{s.v}</div>
                <div className="text-xs text-[#555500] font-medium">{s.l}</div>
                <motion.div
                  className="mt-4 h-0.5 bg-gradient-to-r from-[#808000] to-[#6b6b00] origin-left"
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
      <section className="relative py-16 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0E6] via-[#E8E0D0] to-[#D4C9B5]" />
        <div className="absolute inset-0 overflow-hidden">
          <motion.div animate={{ x: [0, -50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-[#808000]/5 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, 50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/2 -right-1/4 w-[150%] h-[200%] bg-[#808000]/5 rounded-full blur-3xl" />
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#808000]/10 rounded-full border border-[#808000]/20"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#808000] animate-pulse" />
              <span className="text-xs font-semibold text-[#808000] tracking-wide uppercase">Ready in 60 seconds</span>
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#111100] leading-tight"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Ready to Start<br />
              Your Journey?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.35 }}
              className="text-[#555500] text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Join thousands of learners and volunteers making a real difference.
              Start today — completely free, forever.
            </motion.p>

                        <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2 w-full"
            >
              <Magnetic>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(128,128,0,0.25)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 bg-[#808000] text-white font-bold rounded-full shadow-xl text-base hover:bg-[#6b6b00] transition-colors duration-300 flex items-center gap-2"
                  >
                    Get Started Free
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                  </motion.button>
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, borderColor: '#808000', color: '#808000' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 border-2 border-[#808000]/40 text-[#808000] font-bold rounded-full text-base transition-all duration-300"
                  >
                    Become a Volunteer
                  </motion.button>
                </Link>
              </Magnetic>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-8 pt-4 text-[#555500]"
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