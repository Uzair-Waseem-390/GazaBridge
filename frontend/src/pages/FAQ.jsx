// frontend/src/pages/FAQ.jsx
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
import { faqData } from '../data/faq';

// ─── Helpers (same across all pages) ─────────────────────────────────────────
function NoiseOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise-faq">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-faq)" />
    </svg>
  );
}

function MouseGradient() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <div className="absolute inset-0 opacity-25 pointer-events-none" style={{
      backgroundImage: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(128,128,0,0.08) 0%, transparent 50%)`,
    }} />
  );
}

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

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ faq, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative rounded-2xl border overflow-hidden transition-all duration-300
        ${isOpen ? 'border-[#808000]/20 shadow-md shadow-[#808000]/5' : 'border-[#808000]/10 hover:border-[#808000]/20 shadow-sm'}`}
    >
      <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#808000] to-[#6b6b00] transition-transform duration-300 origin-left
        ${isOpen ? 'scale-x-100' : 'scale-x-0'}`} />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-7 py-5 text-left flex justify-between items-center bg-white hover:bg-[#808000]/5 transition-colors group"
      >
        <div className="flex items-center gap-4 flex-1 pr-4">
          <span className="text-[11px] font-bold text-gray-300 font-mono flex-shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-base font-semibold text-[#111100] group-hover:text-[#808000] transition-colors duration-200">
            {faq.question}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300
            ${isOpen ? 'bg-[#808000] text-white' : 'bg-[#808000]/5 text-gray-400 group-hover:bg-[#808000]/10 group-hover:text-[#808000]'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-white"
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="px-7 pb-6 pt-1 flex gap-4"
            >
              <div className="w-px bg-[#808000]/20 flex-shrink-0 ml-[42px]" />
              <p className="text-[#555500] text-sm leading-relaxed">{faq.answer}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function FAQ() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const heroScale   = useTransform(scrollYProgress, [0, 0.55], [1, 0.96]);

  const [search, setSearch] = useState('');
  const filtered = search.trim()
    ? faqData.filter(f =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase())
      )
    : faqData;

  return (
    <div className="bg-[#F5F0E6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <CursorBlob />

      {/* ══════════════════════════════════════════════ HERO ══ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#F5F0E6] pt-24"
      >
        <NoiseOverlay />
        <MouseGradient />

        {/* Grid — Olive */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(128,128,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128,128,0,0.04) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />

        {/* Architectural rings — Olive */}
        <motion.div style={{ y: heroY }}
          className="absolute -right-40 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#808000]/15 pointer-events-none" />
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 80]) }}
          className="absolute -right-64 top-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#808000]/8 pointer-events-none" />
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 40]) }}
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#808000]/4 pointer-events-none" />

        {/* Spinning badge — Olive */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute top-36 right-24 hidden xl:block"
        >
          <motion.div
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-28 h-28 flex items-center justify-center"
          >
            <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 112 112">
              <path id="ring-faq" d="M 56,56 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
              <text fontSize="10" fontFamily="DM Sans, sans-serif" fill="#808000" fontWeight="500" letterSpacing="3">
                <textPath href="#ring-faq">12 QUESTIONS • ALL ANSWERS • 12 QUESTIONS • </textPath>
              </text>
            </svg>
            <div className="w-14 h-14 rounded-full bg-[#808000] flex items-center justify-center shadow-lg shadow-[#808000]/20">
              <span className="text-white text-xl">✦</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero content */}
        <motion.div style={{ y: heroY }} className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl space-y-8">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#808000]/30 shadow-lg"
            >
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#808000]/40 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#808000]" />
              </motion.span>
              <span className="text-sm font-semibold text-[#808000]">{faqData.length} Questions Answered</span>
            </motion.div>

            {/* Headline */}
            <div className="space-y-1 overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-[#111100] leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 700 }}
              >
                Got
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="italic leading-[0.95] tracking-tight"
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 700,
                  background: 'linear-gradient(90deg,#808000,#6b6b00,#555500)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}
              >
                Questions?
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-[#111100] leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 700 }}
              >
                We Have Answers.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.8 }}
              className="text-[#555500] text-lg leading-relaxed max-w-lg"
            >
              Everything you need to know about GazaBridge — how it works, who it's for, and why it's free.
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.8 }}
              className="relative max-w-md"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#808000]/10 rounded-full text-sm text-[#111100] placeholder-gray-400 shadow-sm focus:outline-none focus:border-[#808000] focus:ring-2 focus:ring-[#808000]/20 transition-all duration-200"
              />
                            <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#808000]/5 flex items-center justify-center text-gray-400 hover:bg-[#808000]/10 hover:text-[#808000] transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400">scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
            className="w-5 h-8 border border-gray-300 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 bg-gray-400 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ══════════════════════════════════════════════ FAQ LIST ══ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">

          {/* Label row */}
          <AnimatePresence mode="wait">
            <motion.div
              key={search}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}
              className="flex items-center gap-4 mb-10"
            >
              <div className="h-px w-8 bg-[#808000]" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#808000]">
                {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"` : 'All Questions'}
              </span>
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-400">{filtered.length} total</span>
            </motion.div>
          </AnimatePresence>

          {/* FAQ items */}
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div layout className="space-y-3">
                {filtered.map((faq, index) => (
                  <FAQItem key={faq.question} faq={faq} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#111100] mb-2"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  No matches found
                </h3>
                <p className="text-[#555500] text-sm mb-6">Try a different search term or browse all questions.</p>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSearch('')}
                  className="px-6 py-3 bg-[#808000] text-white text-sm font-semibold rounded-full hover:bg-[#6b6b00] transition-colors"
                >
                  Clear search
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Still have questions card - Cream */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.65 }}
            className="mt-16 relative rounded-3xl overflow-hidden"
          >
            {/* Cream/Beige Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0E6] via-[#E8E0D0] to-[#D4C9B5]" />
            <div className="absolute inset-0 overflow-hidden">
              <motion.div animate={{ x: [0, -30, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-[#808000]/5 rounded-full blur-3xl" />
            </div>
            <NoiseOverlay />

            <div className="relative p-10 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3
                className="text-3xl font-bold text-[#111100] mb-2"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                Still have questions?
              </h3>
              <p className="text-[#555500] mb-7 text-sm leading-relaxed max-w-sm mx-auto">
                Our team is here to help. Reach out any time and we'll get back to you.
              </p>
              <Magnetic>
                <motion.a
                  href="mailto:hello@gazabridge.org"
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#808000] text-white font-bold rounded-full shadow-xl hover:bg-[#6b6b00] transition-colors duration-300 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  hello@gazabridge.org
                </motion.a>
              </Magnetic>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}