// frontend/src/components/Hero.jsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const FloatingElement = ({ children, delay = 0, duration = 6, className = '' }) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{
      y: [-20, 20, -20],
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.15) 0%, transparent 50%)`,
            transition: 'background-image 0.3s ease',
          }}
        />
        
        {/* Floating Elements */}
        <FloatingElement delay={0} duration={7} className="top-20 left-10">
          <div className="w-16 h-16 bg-emerald-200/30 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={2} duration={8} className="top-40 right-20">
          <div className="w-24 h-24 bg-teal-300/20 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={4} duration={6} className="bottom-40 left-1/4">
          <div className="w-20 h-20 bg-emerald-400/20 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={1} duration={9} className="bottom-20 right-1/3">
          <div className="w-12 h-12 bg-cyan-300/20 rounded-full blur-xl" />
        </FloatingElement>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200"
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-emerald-700">Empowering Gaza Through Digital Skills</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl lg:text-7xl font-bold leading-tight"
            >
              <span className="text-gray-900">Build Your </span>
              <span className="relative">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Future
                </span>
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full h-4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.5, duration: 1 }}
                >
                  <path
                    d="M0 10 Q 50 20 100 10 Q 150 0 200 10"
                    fill="none"
                    stroke="rgba(16, 185, 129, 0.3)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </span>
              <br />
              <span className="text-gray-900">With Digital Skills</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl text-gray-600 leading-relaxed max-w-xl"
            >
              Connecting passionate volunteers worldwide with talented individuals in Gaza. 
              Free education, mentorship, and career guidance to build a brighter tomorrow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-full shadow-xl shadow-emerald-500/25 hover:shadow-2xl transition-all duration-300"
                onClick={() => window.location.href = '#'}
              >
                Start Learning Free
                <svg className="inline-block ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-emerald-300 hover:text-emerald-600 transition-all duration-300"
                onClick={() => window.location.href = '#'}
              >
                Become a Volunteer
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex items-center space-x-8 pt-4"
            >
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-lg"
                  >
                    {String.fromCharCode(65 + i)}
                  </motion.div>
                ))}
              </div>
              <div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-700">Trusted by 1000+ learners</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative"
          >
            <div className="relative w-full h-[500px]">
              {/* Main Card */}
              <motion.div
                animate={{
                  rotateY: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-3xl backdrop-blur-3xl border border-white/30 shadow-2xl"
              >
                <div className="absolute inset-4 bg-white/40 backdrop-blur-xl rounded-2xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Digital Skills Platform</h3>
                    <p className="text-gray-600">Learn • Grow • Succeed</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Cards */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute top-10 -left-10 bg-white shadow-xl rounded-2xl p-4 border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Web Development</div>
                    <div className="text-xs text-gray-500">234 mentors available</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute bottom-20 -right-10 bg-white shadow-xl rounded-2xl p-4 border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Career Growth</div>
                    <div className="text-xs text-gray-500">85% success rate</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
                className="absolute top-1/2 -right-20 bg-white shadow-xl rounded-2xl p-3 border border-gray-100"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">100%</div>
                  <div className="text-xs text-gray-600">Free Forever</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center space-y-2 text-gray-400"
        >
          <span className="text-sm">Scroll to explore</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}