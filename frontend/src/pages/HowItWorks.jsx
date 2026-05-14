// frontend/src/pages/HowItWorks.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const volunteerSteps = [
  {
    number: '1',
    title: 'Create a Free Account',
    description: 'Sign up using Google or email in seconds.',
    icon: '👤',
  },
  {
    number: '2',
    title: 'Complete Your Profile',
    description: 'Add your skills, languages, availability, and optionally your LinkedIn and WhatsApp.',
    icon: '📝',
  },
  {
    number: '3',
    title: 'Post an Offer',
    description: 'Describe what you can teach or help with (e.g., English lessons, coding, CV help).',
    icon: '📢',
  },
  {
    number: '4',
    title: 'Browse Needs',
    description: 'Find people in Gaza who need your skills and message them directly.',
    icon: '🔍',
  },
  {
    number: '5',
    title: 'Connect & Teach',
    description: 'Connect via platform messages, WhatsApp chat, or invite them to your WhatsApp group.',
    icon: '💬',
  },
];

const seekerSteps = [
  {
    number: '1',
    title: 'Create a Free Account',
    description: 'Sign up using Google or email in seconds.',
    icon: '👤',
  },
  {
    number: '2',
    title: 'Complete Your Profile',
    description: 'Add your location, languages, and contact info (WhatsApp or Telegram).',
    icon: '📝',
  },
  {
    number: '3',
    title: 'Post a Request',
    description: 'Describe what help you need (e.g., "I want to learn English", "I need help with my CV").',
    icon: '📢',
  },
  {
    number: '4',
    title: 'Browse Volunteers',
    description: 'Find someone with the skills you need and message them directly.',
    icon: '🔍',
  },
  {
    number: '5',
    title: 'Learn for Free',
    description: 'Everything is completely free — volunteers are here to help with no cost to you.',
    icon: '🎓',
  },
];

function StepCard({ step, index, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      className="flex gap-6 items-start group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 360 }}
        transition={{ duration: 0.6 }}
        className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}
      >
        {step.icon}
      </motion.div>
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-sm font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            Step {step.number}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-gray-600 leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-4 border border-emerald-200">
              How It Works
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                How GazaBridge
              </span>
              <br />
              <span className="text-gray-900">Works</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A free platform connecting skilled volunteers worldwide with people in Gaza who need support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Volunteers Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200 mb-6">
                <span className="text-2xl mr-2">🙌</span>
                <span className="text-sm font-semibold text-emerald-700">For Volunteers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Share Your Skills
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  With the World
                </span>
              </h2>
              <div className="space-y-8">
                {volunteerSteps.map((step, index) => (
                  <StepCard key={step.number} step={step} index={index} color="from-emerald-400 to-teal-500" />
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-3xl p-12 backdrop-blur-3xl border border-white/30 shadow-2xl">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-4xl"
                  >
                    🌟
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Volunteer?</h3>
                  <ul className="text-left space-y-4 text-gray-600">
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Make a real difference in someone's life</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Share your expertise with eager learners</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Build cross-cultural connections</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Flexible commitment — teach on your schedule</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Seekers Section */}
      <section className="py-20 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="relative bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-3xl p-12 backdrop-blur-3xl border border-white/30 shadow-2xl">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-4xl"
                  >
                    🎓
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Learn With Us?</h3>
                  <ul className="text-left space-y-4 text-gray-600">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>100% free — no hidden costs ever</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>Learn from experienced professionals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>Flexible learning at your own pace</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>Build skills that lead to real jobs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-6">
                <span className="text-2xl mr-2">🌟</span>
                <span className="text-sm font-semibold text-blue-700">For People in Gaza</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Learn New Skills
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Build Your Future
                </span>
              </h2>
              <div className="space-y-8">
                {seekerSteps.map((step, index) => (
                  <StepCard key={step.number} step={step} index={index} color="from-blue-400 to-cyan-500" />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8">Join our community today and start making a difference.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/#">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-full shadow-lg"
                >
                  Join as a Volunteer
                </motion.button>
              </Link>
              <Link to="/#">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-emerald-300 transition-all"
                >
                  Join as a Learner
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}