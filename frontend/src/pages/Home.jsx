// frontend/src/pages/Home.jsx
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';

// ---------------------------------------------------------------------------
// Animated Counter Hook
// ---------------------------------------------------------------------------
function useCounter(end, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * (end - start) + start));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end, duration, start]);

  return { count, ref };
}

// ---------------------------------------------------------------------------
// Particle Background
// ---------------------------------------------------------------------------
function ParticleBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating Element Component
// ---------------------------------------------------------------------------
const FloatingElement = ({ children, delay = 0, duration = 6, className = '', xRange = 20 }) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{ y: [-xRange, xRange, -xRange] }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// ---------------------------------------------------------------------------
// Section: Hero
// ---------------------------------------------------------------------------
function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 50]);

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
    >
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Mouse-follow Gradient */}
      <div
        className="absolute inset-0 opacity-30 transition-opacity duration-300"
        style={{
          backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.12) 0%, transparent 50%)`,
        }}
      />

      {/* Particle Background */}
      <ParticleBackground />

      {/* Floating Orbs */}
      <FloatingElement delay={0} duration={8} xRange={30} className="top-32 left-20">
        <div className="w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl" />
      </FloatingElement>
      <FloatingElement delay={2} duration={10} xRange={25} className="top-1/4 right-32">
        <div className="w-32 h-32 bg-teal-400/15 rounded-full blur-3xl" />
      </FloatingElement>
      <FloatingElement delay={4} duration={7} xRange={35} className="bottom-1/3 left-1/3">
        <div className="w-20 h-20 bg-cyan-300/20 rounded-full blur-2xl" />
      </FloatingElement>
      <FloatingElement delay={1} duration={9} xRange={20} className="bottom-40 right-1/4">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
      </FloatingElement>

      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
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
              <span className="text-sm font-semibold text-emerald-700">Empowering Gaza Through Digital Skills</span>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight"
              >
                <span className="text-gray-900">Build Your </span>
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                    Future
                  </span>
                  <motion.svg
                    className="absolute -bottom-3 left-0 w-full h-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.5, duration: 1.2, ease: "easeInOut" }}
                  >
                    <path d="M0 15 Q 40 0 80 10 Q 120 20 160 10 Q 200 0 240 10" fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="3" strokeLinecap="round" />
                  </motion.svg>
                </span>
                <br />
                <span className="text-gray-900">With Digital Skills</span>
              </motion.h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl"
            >
              A free platform connecting passionate volunteers worldwide with talented individuals in Gaza. 
              Learn digital skills, build your career, and transform your life — all at no cost.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(16, 185, 129, 0.35)" }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-full shadow-xl shadow-emerald-500/25 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Learning Free
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, borderColor: "rgba(16, 185, 129, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:text-emerald-600 transition-all duration-300"
                >
                  Become a Volunteer
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              <div className="flex -space-x-3">
                {['A', 'M', 'S', 'K'].map((letter, i) => (
                  <motion.div
                    key={letter}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.4 + i * 0.1 }}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg cursor-default"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.svg
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.6 + i * 0.1 }}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-600">Trusted by 1,000+ learners worldwide</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual - 3D Card */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[550px] perspective-1000">
              <motion.div
                animate={{
                  rotateY: [0, 8, 0, -8, 0],
                  rotateX: [0, 3, 0, -3, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-3xl backdrop-blur-3xl border border-white/40 shadow-2xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-4 bg-white/50 backdrop-blur-xl rounded-2xl p-8 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl"
                  >
                    <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">GazaBridge Platform</h3>
                  <p className="text-gray-500 text-center max-w-xs">Connect • Learn • Grow • Succeed</p>

                  {/* Floating Mini Cards */}
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    className="absolute top-10 -left-14 bg-white shadow-xl rounded-2xl p-4 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-lg">🌐</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Web Dev</div>
                        <div className="text-xs text-gray-500">234 mentors</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 6, repeat: Infinity, delay: 1.5 }}
                    className="absolute bottom-20 -right-14 bg-white shadow-xl rounded-2xl p-4 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-lg">🎨</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">UI/UX Design</div>
                        <div className="text-xs text-gray-500">189 mentors</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, delay: 2.5 }}
                    className="absolute top-1/2 -translate-y-1/2 -right-20 bg-white shadow-xl rounded-2xl p-3 border border-gray-100"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">100%</div>
                      <div className="text-xs text-gray-500">Free Forever</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-gray-400"
          >
            <span className="text-xs font-medium tracking-wider uppercase">Scroll to explore</span>
            <motion.svg
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </motion.svg>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// Section: Stats Counter
// ---------------------------------------------------------------------------
function StatsSection() {
  const stats = [
    { value: 5000, suffix: '+', label: 'Active Learners', icon: '🎓' },
    { value: 850, suffix: '+', label: 'Expert Volunteers', icon: '🙌' },
    { value: 45, suffix: '', label: 'Countries Reached', icon: '🌍' },
    { value: 3200, suffix: '+', label: 'Success Stories', icon: '🏆' },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const { count, ref } = useCounter(stat.value, 2500);
            return (
              <motion.div
                key={stat.label}
                ref={ref}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="relative text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-teal-500/0 group-hover:from-emerald-400/5 group-hover:to-teal-500/5 rounded-3xl transition-all duration-500" />
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {count}{stat.suffix}
                </div>
                <div className="text-gray-500 font-medium mt-2">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: How It Works (Preview)
// ---------------------------------------------------------------------------
function HowItWorksPreview() {
  const steps = [
    { step: '01', title: 'Create Free Account', desc: 'Sign up in seconds. No credit card required.', icon: '👤' },
    { step: '02', title: 'Connect with Mentors', desc: 'Get matched with expert volunteers worldwide.', icon: '🤝' },
    { step: '03', title: 'Learn & Practice', desc: 'Access curated resources and live sessions.', icon: '📚' },
    { step: '04', title: 'Launch Your Career', desc: 'Get job-ready with real-world skills.', icon: '🚀' },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/20" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #059669 1px, transparent 0)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-4 border border-emerald-200"
          >
            Simple Process
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            How It <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From sign-up to career launch, we make your learning journey seamless and impactful
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="relative group"
            >
              <div className="relative p-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-[20deg] transition-transform duration-500">
                  <span className="text-lg font-bold text-white">{item.step}</span>
                </div>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-6"
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl" />
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
          <Link to="/how-it-works">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all"
            >
              Learn More About How It Works
              <svg className="inline-block ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Services Preview
// ---------------------------------------------------------------------------
function ServicesPreview() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-emerald-50/20 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-4 border border-emerald-200">
            What We Offer
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Our <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive digital skills training to empower your career journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.slice(0, 6).map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className={`relative p-8 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-[0.03] rounded-3xl transition-opacity duration-500`} />
                
                <motion.div
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-sm`}
                >
                  {service.icon}
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-emerald-600">{service.stats}</span>
                  <motion.span
                    whileHover={{ x: 5 }}
                    className="text-sm font-medium text-gray-400 group-hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    Learn More →
                  </motion.span>
                </div>

                <div className="absolute -top-3 -right-3 w-24 h-24 bg-gradient-to-br from-emerald-400/0 to-teal-500/0 group-hover:from-emerald-400/8 group-hover:to-teal-500/8 rounded-full transition-all duration-500" />
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all"
            >
              View All Services
              <svg className="inline-block ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Testimonials
// ---------------------------------------------------------------------------
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "GazaBridge transformed my life. I went from knowing nothing about coding to landing a remote job in just 8 months.",
      name: "Ahmed S.",
      role: "Web Developer",
      avatar: "A",
      color: "from-emerald-400 to-teal-500",
    },
    {
      quote: "The free resources and personalized mentorship helped me build a portfolio that got me hired. Forever grateful!",
      name: "Sara M.",
      role: "UI/UX Designer",
      avatar: "S",
      color: "from-purple-400 to-pink-500",
    },
    {
      quote: "I never thought I could learn data science for free. The structured curriculum made it possible.",
      name: "Mohammed K.",
      role: "Data Analyst",
      avatar: "M",
      color: "from-blue-400 to-cyan-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-semibold mb-4 border border-emerald-500/30">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            What Our <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Community</span> Says
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Real stories from real people whose lives we've touched
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-emerald-400/30 transition-all duration-500"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed italic">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-emerald-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Features
// ---------------------------------------------------------------------------
function FeaturesSection() {
  const features = [
    { title: '100% Free Forever', desc: 'No hidden costs, no premium features. Everything we offer is and always will be completely free.', icon: '🎓' },
    { title: 'Verified Volunteers', desc: 'All our mentors go through a rigorous verification process to ensure quality teaching.', icon: '✅' },
    { title: 'Global Community', desc: 'Connect with volunteers and learners from over 45 countries worldwide.', icon: '🌍' },
    { title: 'Real Career Impact', desc: '85% of our learners report improved job prospects within 6 months.', icon: '📈' },
    { title: 'Flexible Learning', desc: 'Learn at your own pace with on-demand resources and live sessions.', icon: '⏰' },
    { title: 'Dedicated Support', desc: 'Our team is here to help you succeed every step of the way.', icon: '💬' },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-4 border border-emerald-200">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Why <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">GazaBridge?</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-500 group"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Final CTA
// ---------------------------------------------------------------------------
function FinalCTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
      
      {/* Animated waves */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/4 w-[150%] h-[200%] bg-white/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
          >
            Ready to Start Your
            <br />
            <span className="relative">
              Digital Journey?
              <motion.svg
                className="absolute -bottom-2 left-0 w-full h-5"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                <path d="M0 12 Q 60 0 120 10 Q 180 20 240 10 Q 300 0 360 12" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeLinecap="round" />
              </motion.svg>
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Join thousands of learners and volunteers making a real difference. 
            Start learning today — completely free, forever.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white text-emerald-700 font-bold rounded-full shadow-2xl text-lg hover:shadow-3xl transition-all duration-300"
              >
                Get Started Free
                <svg className="inline-block ml-2 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 border-2 border-white/40 text-white font-bold rounded-full text-lg transition-all duration-300"
              >
                Become a Volunteer
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="flex flex-wrap justify-center gap-8 mt-12 text-white/70"
          >
            {[
              { icon: '🎓', label: 'Free Forever' },
              { icon: '💬', label: 'Live Support' },
              { icon: '🚀', label: 'Job Ready Skills' },
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
  );
}

// ---------------------------------------------------------------------------
// Main Home Export
// ---------------------------------------------------------------------------
export default function Home() {
  return (
    <>
      <Hero />
      <StatsSection />
      <HowItWorksPreview />
      <ServicesPreview />
      <FeaturesSection />
      <TestimonialsSection />
      <FinalCTA />
    </>
  );
}