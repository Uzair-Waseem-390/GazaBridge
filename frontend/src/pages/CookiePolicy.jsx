// frontend/src/pages/CookiePolicy.jsx
import { motion } from 'framer-motion';

export default function CookiePolicy() {
  return (
    <div className="pt-24">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F3EA] via-white to-[#F5F0E6]" />
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Cookie <span className="bg-gradient-to-r from-olive to-olive-dark bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-gray-500 mb-12">Last updated: December 2024</p>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                <p className="text-gray-600 leading-relaxed">
                  Cookies are small text files stored on your device when you visit websites. They help websites 
                  remember your preferences and improve your browsing experience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  GazaBridge uses only essential cookies to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Maintain your login session</li>
                  <li>Remember your preferences</li>
                  <li>Ensure platform security</li>
                  <li>Improve platform functionality</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Session Cookies</h3>
                    <p className="text-gray-600">Temporary cookies that expire when you close your browser. These are essential for platform functionality.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Authentication Cookies</h3>
                    <p className="text-gray-600">Used to keep you logged in and secure your account during your session.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
                <p className="text-gray-600 leading-relaxed">
                  We do not use third-party tracking cookies or analytics cookies. We respect your privacy and 
                  minimize data collection.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
                <p className="text-gray-600 leading-relaxed">
                  You can control and delete cookies through your browser settings. However, disabling essential 
                  cookies may affect platform functionality. Most browsers allow you to refuse cookies or alert 
                  you when cookies are being sent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
                <p className="text-gray-600 leading-relaxed">
                  For questions about our Cookie Policy, contact us at{' '}
                  <a href="mailto:hello@gazabridge.org" className="text-olive hover:text-olive-dark">
                    hello@gazabridge.org
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}