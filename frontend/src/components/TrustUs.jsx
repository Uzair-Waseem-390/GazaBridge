// frontend/src/components/TrustUs.jsx
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const stats = [
  { label: 'Active Learners', value: 5000, suffix: '+' },
  { label: 'Expert Volunteers', value: 850, suffix: '+' },
  { label: 'Success Stories', value: 3200, suffix: '+' },
  { label: 'Countries Reached', value: 45, suffix: '' },
];

const testimonials = [
  {
    name: 'Ahmed S.',
    role: 'Web Developer',
    quote: 'GazaBridge transformed my life. I went from knowing nothing about coding to landing a remote job in just 8 months. The mentors are incredible!',
    rating: 5,
    avatar: 'A',
  },
  {
    name: 'Sara M.',
    role: 'UI/UX Designer',
    quote: 'The free resources and personalized mentorship helped me build a portfolio that got me hired. Forever grateful to this community.',
    rating: 5,
    avatar: 'S',
  },
  {
    name: 'Mohammed K.',
    role: 'Data Analyst',
    quote: 'I never thought I could learn data science for free. The structured curriculum and supportive volunteers made it possible.',
    rating: 5,
    avatar: 'M',
  },
];

const StatCard = ({ stat, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          setCount(stat.value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="text-center p-8"
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
        {count}{stat.suffix}
      </div>
      <div className="text-gray-600 font-medium">{stat.label}</div>
    </motion.div>
  );
};

export default function TrustUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="trust-us" className="relative py-12 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)',
            backgroundSize: '50px 50px',
          }} />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12 md:mb-20"
        >
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </motion.div>

        {/* Why Trust Us Header */}
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
            className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-semibold mb-4 border border-emerald-500/30"
          >
            Trust & Transparency
          </motion.span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Why Trust <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">GazaBridge?</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We're committed to providing free, quality education with complete transparency
          </p>
        </motion.div>

        {/* Trust Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 md:mb-20">
          {[
            {
              title: '100% Free Forever',
              description: 'No hidden costs, no premium features. Everything we offer is and always will be completely free.',
              icon: '🎓',
            },
            {
              title: 'Verified Volunteers',
              description: 'All our mentors go through a rigorous verification process to ensure quality teaching.',
              icon: '✅',
            },
            {
              title: 'Proven Track Record',
              description: "Thousands of success stories from learners who've transformed their careers through our platform.",
              icon: '🏆',
            },
          ].map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-emerald-400/30 transition-all duration-500 group"
            >
              <div className="text-4xl mb-4">{point.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{point.title}</h3>
              <p className="text-gray-400 leading-relaxed">{point.description}</p>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-teal-500/0 group-hover:from-emerald-400/5 group-hover:to-teal-500/5 rounded-2xl transition-all duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-bold text-white mb-4">What Our Community Says</h3>
          <p className="text-gray-400">Real stories from real people whose lives we've touched</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-emerald-400/30 transition-all duration-500"
            >
              {/* Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                {testimonial.avatar}
              </div>

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>

              {/* Author */}
              <div className="border-t border-white/10 pt-4">
                <div className="font-semibold text-white">{testimonial.name}</div>
                <div className="text-sm text-emerald-400">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}