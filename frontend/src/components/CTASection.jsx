// frontend/src/components/CTASection.jsx
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

function NoiseOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
      <filter id="colored-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" stitchTiles="stitch" result="static-noise" />
        <feColorMatrix in="static-noise" type="matrix" values="0.3 0 0 0 0.6 0 0.4 0 0 0.3 0 0 0 0 0.1 0 0 0 1 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#colored-noise)" />
    </svg>
  );
}

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="relative py-16 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0E6] via-[#E8E0D0] to-[#D4C9B5]" />
      <div className="absolute inset-0 overflow-hidden">
        <motion.div animate={{ x: [0, -50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-[#808000]/5 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, 50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="absolute -bottom-1/2 -right-1/4 w-[150%] h-[200%] bg-[#808000]/5 rounded-full blur-3xl" />
      </div>
      <NoiseOverlay />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div ref={ref} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">

          <motion.span initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 bg-[#808000]/10 rounded-full border border-[#808000]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#808000] animate-pulse" />
            <span className="text-xs font-semibold text-[#808000]/80 tracking-wide uppercase">Ready in 60 seconds</span>
          </motion.span>

          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#111100] leading-tight" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Ready to Start<br />
            <span className="relative">Your Journey?
              <motion.svg className="absolute -bottom-2 left-0 w-full h-5" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, duration: 1 }}>
                <path d="M0 12 Q 60 0 120 10 Q 180 20 240 10 Q 300 0 360 12" fill="none" stroke="rgba(128,128,0,0.3)" strokeWidth="4" strokeLinecap="round" />
              </motion.svg>
            </span>
          </motion.h2>

          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }} className="text-[#555500] text-xl max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners and volunteers making a real difference.
            Start today — completely free, forever.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2 w-full">
            <Link to="/register">
              <motion.button whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(128,128,0,0.25)' }} whileTap={{ scale: 0.95 }} className="px-10 py-5 bg-[#808000] text-white font-bold rounded-full shadow-xl text-base hover:bg-[#6b6b00] transition-colors duration-300 flex items-center gap-2">
                Get Started Free
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
              </motion.button>
            </Link>

            <Link to="/register">
              <motion.button whileHover={{ scale: 1.05, borderColor: '#808000', color: '#808000' }} whileTap={{ scale: 0.95 }} className="px-10 py-5 border-2 border-[#808000]/40 text-[#808000] font-bold rounded-full text-base transition-all duration-300">
                Become a Volunteer
              </motion.button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} className="flex flex-wrap justify-center gap-8 pt-4 text-[#555500]">
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
  );
}