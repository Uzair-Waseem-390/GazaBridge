// frontend/src/components/Footer.jsx
import { motion } from 'framer-motion';

const footerLinks = {
  Platform: ['How It Works', 'Services', 'Pricing', 'FAQ'],
  Company: ['About Us', 'Blog', 'Careers', 'Press'],
  Community: ['Volunteers', 'Success Stories', 'Forum', 'Events'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-gray-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 mb-6"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl rotate-12" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                GazaBridge
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-gray-400 mb-6 leading-relaxed"
            >
              Empowering the people of Gaza through free digital skills education. 
              Connecting passionate volunteers with talented learners worldwide.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex space-x-4"
            >
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500/20 transition-all duration-300"
                >
                  <span className="text-sm">{social[0]}</span>
                </a>
              ))}
            </motion.div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 GazaBridge. All rights reserved. Made with ❤️ for Gaza.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}