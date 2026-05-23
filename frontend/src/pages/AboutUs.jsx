// frontend/src/pages/AboutUs.jsx
// Same design system as Home.jsx:
//   Fonts: Instrument Serif + DM Sans (add to index.html)
//   Deps: framer-motion (already installed)

import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { teamMembers } from '../data/team';

// ─── Magnetic button hook ─────────────────────────────────────────────────────
function useMagnetic(strength = 0.4) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }, [strength, x, y]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return { ref, x, y, handleMouseMove, handleMouseLeave };
}

// ─── Magnetic Button wrapper component ───────────────────────────────────────
function MagneticButton({ children, strength = 0.4 }) {
  const magnetic = useMagnetic(strength);
  return (
    <motion.div
      ref={magnetic.ref}
      onMouseMove={magnetic.handleMouseMove}
      onMouseLeave={magnetic.handleMouseLeave}
      style={{ x: magnetic.x, y: magnetic.y }}
    >
      {children}
    </motion.div>
  );
}

// ─── Noise overlay ────────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise-a">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-a)" />
    </svg>
  );
}

// ─── Gradient palette per team member ────────────────────────────────────────
const gradientMap = {
  'from-emerald-400 to-teal-500': { from: '#34d399', to: '#14b8a6' },
  'from-blue-400 to-cyan-500':    { from: '#60a5fa', to: '#06b6d4' },
  'from-purple-400 to-pink-500':  { from: '#c084fc', to: '#ec4899' },
  'from-orange-400 to-red-500':   { from: '#fb923c', to: '#ef4444' },
  'from-indigo-400 to-blue-500':  { from: '#818cf8', to: '#3b82f6' },
};

export default function AboutUs() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[72vh] flex items-end pb-20 overflow-hidden bg-[#f8faf8] pt-28">
        <NoiseOverlay />

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Architectural circles */}
        <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-emerald-200/50 pointer-events-none" />
        <div className="absolute -right-64 top-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-emerald-100/30 pointer-events-none" />
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-emerald-50/60 pointer-events-none" />

        {/* Spinning badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="absolute top-36 right-16 hidden xl:flex items-center justify-center w-28 h-28"
        >
          <svg className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite]" viewBox="0 0 112 112">
            <path id="circle-a" d="M 56,56 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
            <text fontSize="10" fontFamily="DM Sans, sans-serif" fill="#059669" fontWeight="500" letterSpacing="3">
              <textPath href="#circle-a">OUR TEAM • SINCE 2023 • OUR TEAM • SINCE 2023 • </textPath>
            </text>
          </svg>
          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <span className="text-white text-xl">✦</span>
          </div>
        </motion.div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative max-w-7xl mx-auto px-6 w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 max-w-3xl"
          >
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-emerald-400" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600">The People</span>
            </div>

            <h1
              className="text-[clamp(3rem,6.5vw,6rem)] font-bold text-gray-900 leading-[0.95] tracking-tight"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Built by People<br />
              Who <em className="text-emerald-500">Actually Care</em>
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
              We're a small, passionate team driven by one belief: that where you're born should never determine what you can become.
            </p>

            {/* Pull-quote strip */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {teamMembers.map((m, i) => {
                  const g = gradientMap[m.gradient] || { from: '#34d399', to: '#14b8a6' };
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + i * 0.08 }}
                      className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                    >{m.avatar}</motion.div>
                  );
                })}
              </div>
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">{teamMembers.length} team members</span> — and growing
              </span>
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ── STORY SECTION ───────────────────────────────────────────────────── */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-20 items-start">

            {/* Left — sticky heading */}
            <div className="lg:sticky lg:top-32 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px w-8 bg-emerald-400" />
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600">Our Story</span>
                </div>
                <h2
                  className="text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.05] mb-4"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  Why We<br />
                  <em className="text-emerald-500">Built This</em>
                </h2>

                {/* Big stat */}
                <article className="mt-8 bg-slate-950 rounded-3xl p-8 text-white border border-white/10 shadow-2xl shadow-black/30">
                  <h3
                    className="text-[clamp(4rem,8vw,5.5rem)] font-serif leading-[0.95] tracking-tight text-white mb-4"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >45+</h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                    Countries with volunteers who believe that talent is universal — but opportunity isn't.
                  </p>

                  <div className="mt-6 flex items-end gap-2">
                    {[70, 85, 60, 95, 75, 90, 65].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.07, duration: 0.4 }}
                        style={{ height: `${h * 0.3}px`, originY: 1 }}
                        className="flex-1 rounded-2xl bg-gradient-to-t from-emerald-500 to-teal-400 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                      />
                    ))}
                  </div>
                </article>
              </motion.div>
            </div>

            {/* Right — story paragraphs */}
            <div className="space-y-6">
              {[
                {
                  label: 'The Problem',
                  text: `GazaBridge was born from a simple yet powerful idea: that education should transcend borders. We recognised that while there were thousands of talented people in Gaza eager to learn digital skills, they lacked access to structured training and mentorship.`,
                },
                {
                  label: 'The Gap',
                  text: `At the same time, countless professionals worldwide wanted to help but didn't know how to connect meaningfully. There was no bridge — just distance and frustration on both sides.`,
                },
                {
                  label: 'The Solution',
                  text: `Our platform bridges this gap, making it easy for volunteers to share their skills and for learners to access world-class education — all completely free. We believe that by empowering individuals with digital skills, we can help build a more resilient and prosperous future for Gaza.`,
                },
              ].map((block, i) => (
                <motion.div
                  key={block.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-7"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{block.label}</span>
                    <span className="text-gray-200 font-mono text-sm">0{i + 1}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-base">{block.text}</p>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ────────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#f8faf8] overflow-hidden">
        <NoiseOverlay />
        <div className="max-w-7xl mx-auto px-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
          >
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-emerald-400" />
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600">The Team</span>
              </div>
              <h2
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05]"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                Faces Behind<br />
                <em className="text-emerald-500">the Mission</em>
              </h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs lg:text-right">
              A diverse crew united by the belief that digital skills change lives.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((member, index) => {
              const g = gradientMap[member.gradient] || { from: '#34d399', to: '#14b8a6' };
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
                >
                  {/* Hover gradient top bar */}
                  <div
                    className="absolute top-0 left-0 w-full h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                    style={{ background: `linear-gradient(90deg, ${g.from}, ${g.to})` }}
                  />

                  <div className="p-7">
                    {/* Avatar row */}
                    <div className="flex items-start justify-between mb-5">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                      >
                        {member.avatar}
                      </motion.div>

                      {/* Animated online dot */}
                      <div className="flex items-center gap-1.5 bg-emerald-50 rounded-full px-3 py-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600">Active</span>
                      </div>
                    </div>

                    {/* Name + Role */}
                    <h3 className="text-lg font-bold text-gray-900 mb-0.5">{member.name}</h3>
                    <p
                      className="text-sm font-semibold mb-3"
                      style={{ background: `linear-gradient(90deg, ${g.from}, ${g.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >{member.role}</p>

                    {/* Bio */}
                    <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>

                    {/* Bottom line */}
                    <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-medium">GazaBridge Team</span>
                      <motion.div
                        whileHover={{ x: 3 }}
                        className="text-xs font-semibold text-gray-300 group-hover:text-emerald-500 transition-colors cursor-pointer"
                      >
                        Connect →
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── VALUES STRIP ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 rounded-3xl overflow-hidden">
            {[
              { icon: '🎓', title: 'Education First', desc: "Every decision we make is guided by what's best for our learners." },
              { icon: '🤝', title: 'Radical Generosity', desc: 'Free. Always. No exceptions, no upsells, no gated content.' },
              { icon: '🌍', title: 'Borderless', desc: "Knowledge doesn't need a visa. Neither does our platform." },
              { icon: '⚡', title: 'Real Impact', desc: 'We measure success in career outcomes, not website visits.' },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-white px-7 py-9 group hover:bg-emerald-50/40 transition-colors duration-300"
              >
                <div className="text-2xl mb-3">{v.icon}</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1.5">{v.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#f8faf8] relative overflow-hidden">
        <NoiseOverlay />
        
        {/* Animated grid background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0"
            dangerouslySetInnerHTML={{
              __html: `<svg width="100%" height="120%" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;opacity:0.5">
                <defs>
                  <pattern id="ctaGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(16,185,129,0.07)" stroke-width="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ctaGrid)" />
              </svg>`
            }}
          />
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-400/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-teal-400/6 rounded-full blur-[80px] pointer-events-none" />

        {/* Architectural circles */}
        <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-emerald-200/40 pointer-events-none" />
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-50/50 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-5 leading-[0.95]"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Want to join<br />
              <em className="text-emerald-500">our team?</em>
            </h2>
            <p className="text-gray-500 mb-10 text-base leading-relaxed max-w-sm mx-auto">
              We're always looking for passionate volunteers and collaborators who want to make a real difference.
            </p>
            
            {/* Floating Magnetic Buttons */}
            <div className="flex flex-wrap justify-center gap-5">
              {/* Volunteer With Us - Magnetic Button */}
              <MagneticButton strength={0.5}>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative px-8 py-4 bg-gray-900 text-white font-semibold rounded-full overflow-hidden"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    <span className="relative z-10 flex items-center gap-2 text-sm tracking-wide">
                      Volunteer With Us
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="inline-block"
                      >→</motion.span>
                    </span>
                  </motion.button>
                </Link>
              </MagneticButton>

              {/* Get In Touch - Magnetic Button */}
              <MagneticButton strength={0.4}>
                <Link to="/contact">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-4 rounded-full border border-gray-200 bg-white text-gray-700 font-semibold hover:border-emerald-300 transition-colors text-sm tracking-wide"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Get In Touch
                  </motion.button>
                </Link>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}