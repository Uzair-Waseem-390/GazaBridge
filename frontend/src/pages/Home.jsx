// frontend/src/pages/Home.jsx
// ─────────────────────────────────────────────────────────────────────────────
// INSTALL REQUIREMENTS:
//   npm install framer-motion gsap @studio-freight/lenis split-type
//   (react-router-dom already installed)
// ─────────────────────────────────────────────────────────────────────────────
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

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
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-80"
        >
          <source src="/assets/public/gaabridge.mp4" type="video/mp4" />
        </video>
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
// MAIN HOMEPAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#f8faf8] overflow-hidden selection:bg-[#808000] selection:text-white">
      <CursorBlob />
      <Hero />
      <MarqueeStrip />
      <HowItWorksSection />
    </div>
  );
}