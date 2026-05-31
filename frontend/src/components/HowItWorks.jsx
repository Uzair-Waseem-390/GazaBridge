// frontend/src/components/HowItWorks.jsx
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    number: '01',
    title: 'Sign Up for Free',
    description: 'Create your account in seconds. Whether you want to learn or teach, we welcome you with open arms.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Connect with Mentors',
    description: 'Get matched with experienced volunteers who are passionate about helping you succeed in your digital journey.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Learn & Grow',
    description: 'Access curated resources, attend live sessions, and work on real projects to build your portfolio.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Launch Your Career',
    description: 'Receive job guidance, interview prep, and connect with opportunities to start your professional journey.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

const StepCard = ({ step, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div className="relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border border-[#808000]/10">
        {/* Number - Olive */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-[#808000] to-[#6b6b00] rounded-xl flex items-center justify-center shadow-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-500">
          <span className="text-lg font-bold text-white">{step.number}</span>
        </div>

        {/* Icon - Olive */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 bg-gradient-to-br from-[#808000]/5 to-[#808000]/10 rounded-2xl flex items-center justify-center mb-6 text-[#808000]"
        >
          {step.icon}
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold text-[#111100] mb-3">{step.title}</h3>
        <p className="text-[#555500] leading-relaxed">{step.description}</p>

        {/* Hover Line - Olive */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#808000] to-[#6b6b00] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl" />
      </div>

      {/* Connection Line - Olive */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#808000]/30 to-transparent" />
      )}
    </motion.div>
  );
};

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      {/* Background Pattern - Olive */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #808000 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 bg-[#808000]/5 text-[#808000] rounded-full text-sm font-semibold mb-4 border border-[#808000]/20"
          >
            Simple Process
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#111100] mb-4" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            How It <span style={{
              background: 'linear-gradient(90deg,#808000,#6b6b00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Works</span>
          </h2>
          <p className="text-xl text-[#555500] max-w-2xl mx-auto">
            From sign-up to career launch, we make your journey seamless and impactful
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Bottom CTA - Olive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-[#808000] to-[#6b6b00] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
            onClick={() => window.location.href = '#'}
          >
            Start Your Journey Now
            <svg className="inline-block ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}