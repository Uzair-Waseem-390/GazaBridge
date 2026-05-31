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
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-[#F5F3EA]">
      {/* ── Background Elements (تأثير الإضاءة بالماوس والدوائر بالـ utilities المخصصة) ── */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 153, 19, 0.15) 0%, transparent 50%)`,
            transition: 'background-image 0.3s ease',
          }}
        />
        
        <FloatingElement delay={0} duration={7} className="top-20 left-10">
          <div className="w-16 h-16 bg-orange-10 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={2} duration={8} className="top-40 right-20">
          <div className="w-24 h-24 bg-olive-15 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={4} duration={6} className="bottom-40 left-1/4">
          <div className="w-20 h-20 bg-orange-10 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={1} duration={9} className="bottom-20 right-1/3">
          <div className="w-12 h-12 bg-olive-10 rounded-full blur-xl" />
        </FloatingElement>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:px-6 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* ── Left Content (النصوص والأزرار) ── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 md:space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            {/* الشارة العلوية - تستخدم bg-olive-5 و border-olive-20 و text-olive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center px-4 py-2 bg-olive-5 rounded-full border border-olive-20"
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange" />
              </span>
              <span className="text-sm font-medium text-olive">Empowering Gaza Through Digital Skills</span>
            </motion.div>

            {/* العنوان الرئيسي - التدرج يستخدم الألوان المعرفة بالأسم من الثيم الجديد */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight"
            >
              <span className="text-gray-900">Build Your </span>
              <span className="relative">
                <span className="bg-gradient-to-r from-olive to-orange bg-clip-text text-transparent">
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
                    stroke="rgba(255, 153, 19, 0.4)"
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
              className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl"
            >
              Connecting passionate volunteers worldwide with talented individuals in Gaza. 
              Free education, mentorship, and career guidance to build a brighter tomorrow.
            </motion.p>

            {/* الأزرار التفاعلية - تستخدم التدرج بين الألوان الجديدة للثيم */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 153, 19, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-orange to-orange-light text-white font-semibold rounded-full shadow-xl shadow-orange/25 hover:shadow-2xl transition-all duration-300"
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
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-olive hover:text-olive transition-all duration-300"
                onClick={() => window.location.href = '#'}
              >
                Become a Volunteer
              </motion.button>
            </motion.div>

            {/* مؤشرات الثقة */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 pt-4"
            >
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-olive to-olive-light flex items-center justify-center text-white text-xs font-bold shadow-lg"
                  >
                    {String.fromCharCode(65 + i)}
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm font-semibold text-gray-700">Trusted by 1000+ learners</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right Visual (البطاقات التفاعلية معتمدة بالكامل على الألوان الجديدة) ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative flex justify-center items-center"
          >
            <div className="relative w-full max-w-[440px] h-[520px] flex items-center justify-center">
              
              {/* الدائرة الخلفية الكبيرة الملونة بالزيتي الفاتح */}
              <div className="absolute w-[360px] h-[360px] bg-olive-10 rounded-full -z-10 blur-sm" />

              {/* البطاقة الرئيسية البيضاء */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col justify-between"
              >
                {/* الجزء العلوي: أيقونة الكتاب وزر LIVE PLATFORM */}
                <div className="flex justify-between items-center mb-6">
                  <div className="w-12 h-12 bg-olive text-white rounded-2xl flex items-center justify-center shadow-lg shadow-olive/25">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 bg-orange-10 text-orange text-xs font-bold rounded-full tracking-wider">
                    LIVE PLATFORM
                  </span>
                </div>

                {/* العنوان ومؤشر النسبة المتدرج */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-gray-800 font-bold text-lg">
                    <span>Web Development</span>
                    <span className="text-olive">68%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-[68%] h-full bg-gradient-to-r from-olive to-orange rounded-full" />
                  </div>
                </div>

                {/* بطاقة الشخص (Jane D) */}
                <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange to-orange-light text-white flex items-center justify-center font-bold text-sm shadow-md">
                      JD
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">Jane D.</div>
                      <div className="text-xs text-gray-500">Senior Engineer @ Google</div>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-olive shadow-sm shadow-olive/50" />
                </div>

                {/* العدادات الثلاثية السفلى */}
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                    <div className="font-bold text-gray-800 text-base">24</div>
                    <div className="text-[10px] text-gray-400 font-medium">Lessons</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                    <div className="font-bold text-gray-800 text-base">8</div>
                    <div className="text-[10px] text-gray-400 font-medium">Projects</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                    <div className="font-bold text-orange text-lg leading-none">∞</div>
                    <div className="text-[10px] text-gray-400 font-medium">Support</div>
                  </div>
                </div>

                {/* شريط موعد الجلسة القادمة */}
                <div className="bg-olive-5 rounded-xl p-3 flex items-center space-x-2 border border-olive-10">
                  <svg className="w-4 h-4 text-olive" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">
                    Next session in <strong className="text-olive font-semibold">2h 14m</strong>
                  </span>
                </div>
              </motion.div>

              {/* ── العناصر العائمة المضافة ── */}
              
              {/* بطاقة 45 Countries العلوية */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-4 -right-4 bg-white shadow-xl rounded-2xl p-3 border border-gray-100 flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-orange-10 text-orange rounded-full flex items-center justify-center text-sm">
                  🌍
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">45 Countries</div>
                  <div className="text-[10px] text-gray-400">Mentors connected</div>
                </div>
              </motion.div>

              {/* الدائرة الدوّارة بنجمة مضيئة */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -top-8 right-24 w-12 h-12 bg-orange rounded-full flex items-center justify-center text-white font-bold text-[8px] shadow-lg shadow-orange/30"
              >
                <span className="absolute animate-pulse text-sm">✦</span>
              </motion.div>

              {/* بطاقة قصص النجاح السفلية */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white shadow-xl rounded-xl p-3 border border-gray-100 flex items-center space-x-2"
              >
                <span className="text-base">🏆</span>
                <div>
                  <div className="text-xs font-bold text-gray-800">3,200 Success Stories</div>
                  <div className="text-[9px] text-gray-400">And counting...</div>
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
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center space-y-2 text-gray-400"
        >
          <span className="text-sm font-medium">Scroll to explore</span>
          <svg className="w-6 h-6 text-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}