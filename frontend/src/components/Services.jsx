// frontend/src/components/Services.jsx
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const services = [
  {
    title: 'Web Development',
    description: 'Master HTML, CSS, JavaScript, React, and Node.js with hands-on projects and real-world applications.',
    icon: '🌐',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    stats: '2,450+ Learners',
  },
  {
    title: 'UI/UX Design',
    description: 'Learn design thinking, Figma, prototyping, and create beautiful user experiences that matter.',
    icon: '🎨',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    stats: '1,890+ Learners',
  },
  {
    title: 'Digital Marketing',
    description: 'Understand SEO, social media, content strategy, and grow businesses through digital channels.',
    icon: '📈',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    stats: '1,560+ Learners',
  },
  {
    title: 'Data Science',
    description: 'Dive into Python, machine learning, and data analytics to solve complex problems.',
    icon: '📊',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    stats: '980+ Learners',
  },
  {
    title: 'Mobile Development',
    description: 'Build iOS and Android apps with React Native and Flutter for the mobile-first world.',
    icon: '📱',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
    stats: '1,230+ Learners',
  },
  {
    title: 'Career Coaching',
    description: 'Get personalized guidance on CV building, interviews, and landing your dream job.',
    icon: '🎯',
    color: 'from-teal-500 to-green-500',
    bgColor: 'bg-teal-50',
    stats: '3,100+ Sessions',
  },
];

const ServiceCard = ({ service, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative"
    >
      <div className={`relative p-8 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}>
        {/* Gradient Overlay on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
        
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mb-6 text-3xl`}
        >
          {service.icon}
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
          {service.title}
        </h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {service.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm font-semibold text-emerald-600">{service.stats}</span>
          <motion.button
            whileHover={{ x: 5 }}
            className="text-sm font-medium text-gray-400 group-hover:text-emerald-600 transition-colors"
            onClick={() => window.location.href = '#'}
          >
            Learn More →
          </motion.button>
        </div>

        {/* Corner Decoration */}
        <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-emerald-400/0 to-teal-500/0 group-hover:from-emerald-400/10 group-hover:to-teal-500/10 rounded-full transition-all duration-500" />
      </div>
    </motion.div>
  );
};

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="services" className="relative py-24 bg-gradient-to-b from-white via-emerald-50/30 to-white">
      <div className="max-w-7xl mx-auto px-6">
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
            className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-4 border border-emerald-200"
          >
            What We Offer
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive digital skills training to empower your career journey
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}