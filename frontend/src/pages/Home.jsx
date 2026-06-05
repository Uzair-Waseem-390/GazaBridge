// frontend/src/pages/Home.jsx
// ─────────────────────────────────────────────────────────────────────────────
// INSTALL REQUIREMENTS:
//   npm install framer-motion gsap @studio-freight/lenis split-type
//   (react-router-dom already installed)
// ─────────────────────────────────────────────────────────────────────────────
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';
import CTASection from '../components/CTASection';

// ─────────────────────────────────────────────────────────────────────────────
// MAGNETIC BUTTON HOOK
// ─────────────────────────────────────────────────────────────────────────────
function useMagnetic(strength = 0.4) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }, [strength, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { ref, x, y, handleMouseMove, handleMouseLeave };
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED NUMBER
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }) {
  const ref = useRef(null);
  const [displayed, setDisplayed] = useState(0);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun) {
        setHasRun(true);
        const end = value;
        const duration = 2200;
        const startTime = performance.now();
        const tick = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setDisplayed(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasRun]);

  return <span ref={ref}>{displayed.toLocaleString()}{suffix}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOISE TEXTURE SVG
// ─────────────────────────────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08] mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
      <filter id="colored-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" stitchTiles="stitch" result="static-noise" />
        <feColorMatrix in="static-noise" type="matrix" values="
          0.3  0.0  0.0  0.0  0.6    
          0.0  0.4  0.0  0.0  0.3    
          0.0  0.0  0.0  0.0  0.1    
          0.0  0.0  0.0  1.0  0.0" 
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#colored-noise)" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR BLOB (تم تعديل اللون إلى زيتي خفيف وناعم جداً للخلفية)
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
        blobRef.current.style.transform = `translate(${pos.current.x - 250}px, ${pos.current.y - 250}px)`;
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
      <div className="w-full h-full rounded-full bg-[#808000]/4 blur-[90px]" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARQUEE STRIP (Light Orange Translucent & Olive Accents)
// ─────────────────────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = ['Web Development', '✦', 'UI/UX Design', '✦', 'Data Science', '✦', 'Digital Marketing', '✦', 'Freelancing', '✦', 'AI & Machine Learning', '✦', 'Cybersecurity', '✦', 'Mobile Apps', '✦'];
  const doubled = [...items, ...items];

  return (
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
        {doubled.map((item, i) => (
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: STATS — horizontal scroll + counter
// ─────────────────────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: 5000, suffix: '+', label: 'Active Learners', desc: 'from Gaza enrolled today', icon: '🎓' },
    { value: 850, suffix: '+', label: 'Expert Volunteers', desc: 'from 45 countries', icon: '🙌' },
    { value: 45, suffix: '', label: 'Countries Reached', desc: 'globally connected', icon: '🌍' },
    { value: 3200, suffix: '+', label: 'Success Stories', desc: 'lives transformed', icon: '🏆' },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-16"
        >
          <div className="h-px w-12 bg-[#808000]/50" />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#808000]" style={{ fontFamily: "'DM Sans', sans-serif" }}>By The Numbers</span>
        </motion.div>

        <div className="pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 lg:pb-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 rounded-3xl">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-white px-8 py-10 transition-colors duration-300 hover:bg-[#808000]/5 rounded-2xl"
              >
                <div className="text-3xl mb-4">{s.icon}</div>
                <div
                  className="text-4xl xl:text-5xl font-bold text-gray-900 mb-1 tabular-nums"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.label}</div>
                <div className="text-xs text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.desc}</div>
                <motion.div
                  className="mt-5 h-0.5 origin-left bg-gradient-to-r from-[#808000] to-[#ff9913]"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// SECTION: HERO (With Video Background) - مصلح ومغلق بالكامل وبألوان زيتية وكريمية
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const [tick, setTick] = useState(0);

  const words = ['Future', 'Career', 'Skills', 'Freedom', 'Story'];
  const wordIndex = tick % words.length;

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2600);
    return () => clearInterval(id);
  }, []);

  const magnetic = useMagnetic(0.5);
  const magnetic2 = useMagnetic(0.4);

  return (
    <motion.section
      style={{ opacity }}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#f8faf8]"
    >
      {/* GIF Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <img
          src="/assets/public/bride.gif"
          alt="Background GIF"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[#f8faf8]/20" />
      </div>

      <NoiseOverlay />

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(128, 128, 0, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128, 128, 0, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* BACKGROUND ELEMENTS (Olive Circles & Warm Light Glows) */}
      <motion.div
        style={{ y }}
        className="absolute -right-40 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#808000]/20 pointer-events-none"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 80]) }}
        className="absolute -right-64 top-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#808000]/10 pointer-events-none"
      />
      
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 40]) }}
        className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#fcedde]/30 pointer-events-none"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, 40]) }}
        className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#fcedde]/60 pointer-events-none"
      />

      {/* FLOATING BADGE (Olive Themed Spinning Text) */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute top-36 right-24 hidden xl:block"
      >
        <motion.div
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-28 h-28 flex items-center justify-center"
        >
          <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 112 112">
            <path id="circle-text" d="M 56,56 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
            <text fontSize="10" fontFamily="DM Sans, sans-serif" fill="#808000" fontWeight="600" letterSpacing="3">
              <textPath href="#circle-text">FREE FOREVER • LEARN TODAY • FREE FOREVER • </textPath>
            </text>
          </svg>
          <div className="w-14 h-14 rounded-full bg-[#808000] flex items-center justify-center shadow-xl shadow-[#808000]/20">
            <span className="text-white text-xl">✦</span>
          </div>
        </motion.div>
      </motion.div>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-28 pb-12 md:pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 md:gap-20 items-center">
          
          {/* LEFT COLUMN */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#808000]/60 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#808000]" />
                </span>
                <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">Empowering Gaza</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#808000]/30 to-transparent" />
            </motion.div>
            
            <div className="space-y-0">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <h1
                  className="text-4xl md:text-5xl lg:text-[6.5rem] font-serif leading-[0.95] tracking-tight text-gray-900"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  Build Your
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-end gap-4 overflow-visible"
              >
                <div className="relative overflow-hidden" style={{ height: 'clamp(3.2rem,7vw,6.5rem)', minWidth: '250px' }}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '-100%' }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 bg-[#808000] bg-clip-text text-transparent font-serif italic"
                      style={{
                        fontSize: 'clamp(3.2rem,7vw,6.5rem)',
                        lineHeight: '0.95',
                        display: 'block'
                      }}
                    >
                      {words[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1
                  className="text-[clamp(3.2rem,7vw,6.5rem)] font-serif leading-[0.95] tracking-tight text-gray-900"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  With Digital Skills
                </h1>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-gray-500 text-lg leading-relaxed max-w-lg"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              A free platform connecting passionate volunteers worldwide with talented individuals in Gaza.
              Learn digital skills, build your career, and transform your life — at zero cost.
            </motion.p>
            
            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.8 }}
              className="flex flex-col items-center gap-4 mt-8 sm:flex-row sm:items-center sm:justify-start"
            >
              <motion.div
                className="w-full sm:w-auto"
                ref={magnetic.ref}
                onMouseMove={magnetic.handleMouseMove}
                onMouseLeave={magnetic.handleMouseLeave}
                style={{ x: magnetic.x, y: magnetic.y }}
              >
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto group relative px-8 py-4 bg-gray-900 text-white font-semibold rounded-full overflow-hidden"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <motion.span className="absolute inset-0 bg-[#808000] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 flex items-center justify-center gap-2 text-sm tracking-wide">
                      Start Learning Free
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="inline-block">→</motion.span>
                    </span>
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div
                className="w-full sm:w-auto"
                ref={magnetic2.ref}
                onMouseMove={magnetic2.handleMouseMove}
                onMouseLeave={magnetic2.handleMouseLeave}
                style={{ x: magnetic2.x, y: magnetic2.y }}
              >
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto px-8 py-4 rounded-full border border-gray-200 bg-white text-gray-700 font-semibold hover:border-[#808000]/30 transition-colors text-sm tracking-wide"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Volunteer With Us
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex items-center gap-6 pt-2"
            >
              <div className="flex -space-x-2">
                {['A', 'M', 'S', 'K', 'R'].map((l, i) => (
                  <motion.div
                    key={l}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.1 + i * 0.07 }}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, #808000, #a3a322)` }}
                  >
                    {l}
                  </motion.div>
                ))}
              </div>
              <div className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span className="font-semibold text-gray-800">1,000+</span> learners trust us
              </div>
            </motion.div>
          </div>

          {/* RIGHT — stacked card pile */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:flex items-center justify-center h-[520px]"
          >
            <motion.div animate={{ rotate: [-6, -4, -6] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute w-72 h-96 bg-[#fcedde]/40 rounded-3xl border border-[#fcedde]" />
            <motion.div animate={{ rotate: [3, 5, 3] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute w-72 h-96 bg-[#808000]/5 rounded-3xl border border-[#808000]/10" />

            {/* Main card */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative z-10 w-72 bg-white rounded-3xl shadow-2xl shadow-gray-900/5 border border-gray-100 p-7 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#808000] flex items-center justify-center shadow-lg shadow-[#808000]/20">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold text-[#808000] bg-[#808000]/10 px-3 py-1 rounded-full tracking-wide uppercase">Live Platform</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>Web Development</span>
                  <span className="text-sm text-[#808000] font-semibold">68%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ delay: 1.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }} className="h-full bg-[#808000]" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">JD</div>
                <div>
                  <div className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>Jane D.</div>
                  <div className="text-xs text-gray-500">Senior Engineer @ Google</div>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-[#808000] flex-shrink-0" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { v: '24', label: 'Lessons' },
                  { v: '8', label: 'Projects' },
                  { v: '∞', label: 'Support' },
                ].map(s => (
                  <div key={s.label} className="text-center bg-gray-50 rounded-xl py-2.5">
                    <div className="text-base font-bold text-gray-900">{s.v}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 bg-[#808000]/5 rounded-xl px-3 py-2.5">
                <span className="text-[#808000]">▶</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Next session in <strong className="text-[#808000]">2h 14m</strong></span>
              </div>
            </motion.div>

            {/* Floating chips */}
            <motion.div animate={{ y: [0, -8, 0], x: [0, 4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className="absolute top-4 right-0 bg-white shadow-xl shadow-black/5 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 z-20">
              <span className="text-base">🌍</span>
              <div>
                <div className="text-xs font-semibold text-gray-800">45 Countries</div>
                <div className="text-[10px] text-gray-400">Mentors connected</div>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0, 10, 0], x: [0, -4, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} className="absolute bottom-8 left-0 bg-white shadow-xl shadow-black/5 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 z-20">
              <span className="text-base">🏆</span>
              <div>
                <div className="text-xs font-semibold text-gray-800">3,200 Success Stories</div>
                <div className="text-[10px] text-gray-400">And counting...</div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Scroll hint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="w-5 h-8 border border-gray-300 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-1.5 bg-gray-400 rounded-full" />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: HOW IT WORKS — vertical timeline (تم تعديل الألوان بالكامل للزيتي)
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Create Free Account',
      desc: 'Sign up in under 60 seconds. No credit card, no commitments — just your name and email.',
      detail: 'Instant access to our full platform on day one.',
      icon: '👤',
    },
    {
      num: '02',
      title: 'Connect with Mentors',
      desc: 'Get intelligently matched with expert volunteers from top global companies.',
      detail: 'Average match time: under 48 hours.',
      icon: '🤝',
    },
    {
      num: '03',
      title: 'Learn & Build',
      desc: 'Access curated resources, live coding sessions, and real-world projects.',
      detail: 'Structured paths that go from zero to job-ready.',
      icon: '📚',
    },
    {
      num: '04',
      title: 'Launch Your Career',
      desc: 'Land your first remote job or freelance client with our career support.',
      detail: '85% of graduates report new opportunities within 6 months.',
      icon: '🚀',
    },
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '100%']);

  return (
    <section ref={containerRef} className="py-32 bg-[#f8faf8] relative overflow-hidden">
      <NoiseOverlay />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_3fr] gap-16 items-start">

          {/* LEFT — sticky heading */}
          <div className="lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[#808000]/50" />
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#808000]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Process</span>
              </div>
              <h2
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05]"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                How It<br />
                <em className="text-[#808000] not-italic">Works</em>
              </h2>
              <p className="text-gray-500 leading-relaxed text-sm max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                A seamless journey from signup to career launch — crafted for your success.
              </p>
              <Link to="/how-it-works">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="text-sm font-semibold text-gray-900 flex items-center gap-2 group border border-gray-200 rounded-full px-5 py-2.5 hover:border-[#808000]/40 hover:text-[#808000] transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  See full process
                  <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT — timeline steps */}
          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gray-200">
              <motion.div style={{ height: lineHeight }} className="w-full bg-[#808000]/40 origin-top" />
            </div>

            <div className="space-y-6">
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="group relative pl-16"
                >
                  <motion.div
                    whileInView={{ scale: [0, 1.3, 1] }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.5 }}
                    className="absolute left-0 top-6 w-12 h-12 rounded-full bg-white border-2 border-gray-200 group-hover:border-[#808000]/50 transition-colors duration-300 flex items-center justify-center shadow-sm"
                  >
                    <span className="text-lg">{s.icon}</span>
                  </motion.div>

                  <motion.div whileHover={{ x: 6 }} transition={{ duration: 0.2 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-7">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.title}</h3>
                      <span className="text-[11px] font-bold text-gray-300 tracking-widest" style={{ fontFamily: 'monospace' }}>{s.num}</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.desc}</p>
                    <div className="text-xs font-semibold text-[#808000] bg-[#808000]/5 inline-block px-3 py-1 rounded-md">{s.detail}</div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: SERVICES — bento grid
// ─────────────────────────────────────────────────────────────────────────────
function ServicesSection() {
  const featured = services.slice(0, 6);
  const sizes = ['lg', 'sm', 'sm', 'sm', 'lg', 'sm'];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-[#808000]/50" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#808000]" style={{ fontFamily: "'DM Sans', sans-serif" }}>What We Offer</span>
            </div>
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05]"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Skills That<br />
              <em className="text-[#808000] not-italic">Pay Bills</em>
            </h2>
          </div>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm lg:text-right" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Comprehensive digital training paths that take you from complete beginner to market-ready professional.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.07, duration: 0.55 }}
              className={`group relative rounded-3xl border border-gray-100 bg-white overflow-hidden cursor-pointer
                ${sizes[i] === 'lg' ? 'md:col-span-2 lg:col-span-1' : ''}`}
              style={{ minHeight: sizes[i] === 'lg' ? '280px' : '220px' }}
            >
              {/* Hover gradient */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(ellipse at top left, rgba(128,128,0,0.06) 0%, transparent 60%)`,
                }}
              />

              {/* Bottom border reveal */}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#808000] to-[#ff9913] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

              <div className="p-7 h-full flex flex-col justify-between">
                <div>
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl mb-5 group-hover:bg-[#808000]/10 transition-colors"
                  >
                    {service.icon}
                  </motion.div>
                  <h3
                    className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#808000] transition-colors"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >{service.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>{service.description}</p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                  <span className="text-xs font-semibold text-[#808000] bg-[#808000]/10 px-3 py-1 rounded-full">{service.stats}</span>
                  <motion.span
                    whileHover={{ x: 3 }}
                    className="text-xs text-gray-400 group-hover:text-[#808000] transition-colors font-medium"
                  >Explore →</motion.span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/services">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-[#808000] transition-colors duration-300"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Browse All 20+ Skills
              <span>→</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TESTIMONIALS
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "GazaBridge transformed my life. I went from knowing nothing about coding to landing a remote job in just 8 months. This platform is genuinely life-changing.",
      name: "Ahmed S.", role: "Web Developer @ Remote Startup", avatar: "AS", color: 'from-[#808000] to-[#a3a322]',
    },
    {
      quote: "The personalized mentorship helped me build a portfolio that got me hired as a UI/UX designer. The free resources are world-class. Forever grateful.",
      name: "Sara M.", role: "UI/UX Designer @ Agency", avatar: "SM", color: 'from-purple-400 to-pink-500',
    },
    {
      quote: "I never thought I could learn data science for free. The structured curriculum and my mentor's guidance made the impossible feel completely achievable.",
      name: "Mohammed K.", role: "Data Analyst @ Tech Co", avatar: "MK", color: 'from-blue-400 to-cyan-500',
    },
    {
      quote: "Within 6 months I was freelancing on international projects. GazaBridge didn't just teach me skills — it gave me confidence and a real income.",
      name: "Layla A.", role: "Freelance Developer", avatar: "LA", color: 'from-amber-400 to-orange-500',
    },
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % testimonials.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-32 bg-gray-900 relative overflow-hidden">
      <NoiseOverlay />

      {/* Large quote mark */}
      <div
        className="absolute top-16 left-12 text-[200px] leading-none text-white/[0.03] font-serif select-none pointer-events-none"
        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
      >"</div>

      <div className="max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-[#808000]" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#a3a322]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Testimonials</span>
            </div>
            <h2
              className="text-5xl lg:text-6xl font-bold text-white leading-[1.05]"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Real Stories,<br />
              <em className="text-[#a3a322] not-italic">Real Impact</em>
            </h2>
          </div>

          {/* Pagination dots */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`transition-all duration-300 rounded-full ${i === active ? 'w-8 h-2 bg-[#a3a322]' : 'w-2 h-2 bg-gray-600 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              onClick={() => setActive(i)}
              className={`relative rounded-3xl p-7 border cursor-pointer transition-all duration-400 group
                ${i === active
                  ? 'bg-white border-white/20 shadow-2xl shadow-[#808000]/20'
                  : 'bg-white/[0.04] border-white/[0.06] hover:border-white/10 hover:bg-white/[0.07]'
                }`}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, s) => (
                  <svg key={s} className={`w-3.5 h-3.5 ${i === active ? 'text-amber-400' : 'text-amber-400/40'} transition-colors`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p
                className={`text-sm leading-relaxed mb-6 ${i === active ? 'text-gray-700' : 'text-gray-400'} transition-colors`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >"{t.quote}"</p>

              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${i === active ? 'text-gray-900' : 'text-gray-300'} transition-colors`} style={{ fontFamily: "'DM Sans', sans-serif" }}>{t.name}</div>
                  <div className={`text-[11px] ${i === active ? 'text-[#808000]' : 'text-[#808000]/50'} transition-colors`} style={{ fontFamily: "'DM Sans', sans-serif" }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: FEATURES
// ─────────────────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    { title: '100% Free, Forever', desc: 'No hidden costs, no premium tiers. Every resource, mentor, and tool is free.', icon: '🎓' },
    { title: 'Verified Expert Mentors', desc: 'Every mentor passes a rigorous multi-step verification process.', icon: '✅' },
    { title: 'Global Community', desc: 'Connect with volunteers and learners from over 45 countries.', icon: '🌍' },
    { title: 'Real Career Impact', desc: '85% of learners report improved job prospects within 6 months.', icon: '📈' },
    { title: 'Flexible Pace', desc: 'Learn on your schedule — on-demand resources and live sessions, your way.', icon: '⏰' },
    { title: 'Dedicated Support', desc: 'Our team is available every step of your journey.', icon: '💬' },
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const xLeft = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const xRight = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={containerRef} className="py-32 bg-[#f8faf8] overflow-hidden">
      <NoiseOverlay />
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* ===== اليسار — العنوان + 3 بطاقات ===== */}
          <motion.div style={{ x: xLeft }}>
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px w-8 bg-[#808000]" />
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#808000]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Why GazaBridge
                  </span>
                </div>
                <h2
                  className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05]"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  Built Different.<br />
                  <em className="text-[#808000] not-italic">Built For You.</em>
                </h2>
              </div>

              {/* البطاقات الثلاث — يسار */}
              <div className="space-y-3">
                {features.slice(0, 3).map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ x: 6 }}
                    className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default group"
                  >
                    <div className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {f.title}
                      </h4>
                      <p className="text-gray-500 text-xs leading-relaxed"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {f.desc}
                      </p>
                    </div>
                    {/* الخط الجانبي الأخضر عند hover */}
                    <div
                      className="ml-auto w-1 h-full flex-shrink-0 self-stretch rounded-full bg-gray-100 group-hover:bg-[#808000] transition-colors duration-300"
                      style={{ minHeight: '40px' }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ===== اليمين — البطاقة الخضراء 85% + 3 بطاقات ===== */}
          <motion.div style={{ x: xRight }} className="space-y-8">

            {/* البطاقة الخضراء الكبيرة */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-[#808000] to-[#a3a322] rounded-3xl p-8 text-white overflow-hidden"
            >
              <NoiseOverlay />
              {/* Blobs زخرفية */}
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
              <div className="relative">
                <div className="text-5xl mb-4">📈</div>
                <div
                  className="text-5xl font-bold mb-2"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >85%</div>
                <p className="text-white/80 text-sm leading-relaxed"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  of our graduates report improved career outcomes within 6 months of completing their learning path.
                </p>
              </div>
            </motion.div>

            {/* البطاقات الثلاث — يمين */}
            <div className="space-y-3">
              {features.slice(3).map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ x: -6 }}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default group"
                >
                  <div className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {f.title}
                    </h4>
                    <p className="text-gray-500 text-xs leading-relaxed"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {f.desc}
                    </p>
                  </div>
                  <div
                    className="ml-auto w-1 self-stretch flex-shrink-0 rounded-full bg-gray-100 group-hover:bg-[#808000] transition-colors duration-300"
                    style={{ minHeight: '40px' }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HOMEPAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#f8faf8] overflow-hidden selection:bg-[#808000] selection:text-white">
      <CursorBlob />
      <Hero />
      <MarqueeStrip />
      <StatsSection />
      <HowItWorksSection />
      <ServicesSection />
      <TestimonialsSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}