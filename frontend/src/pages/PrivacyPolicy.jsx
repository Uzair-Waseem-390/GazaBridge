// frontend/src/pages/PrivacyPolicy.jsx
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="pt-24">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Privacy <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-gray-500 mb-12">Last updated: December 2024</p>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 leading-relaxed">
                  When you create an account on GazaBridge, we collect information you provide such as your name, 
                  email address, skills, languages, location, and contact information (WhatsApp, Telegram, LinkedIn). 
                  You control what information you share on your profile.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use your information to create and manage your account, facilitate connections between volunteers 
                  and seekers, and improve our platform. We never sell or share your personal data with third parties 
                  for marketing purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Profile Visibility</h2>
                <p className="text-gray-600 leading-relaxed">
                  Your profile information is visible only to logged-in users of GazaBridge. You can choose to hide 
                  specific contact details at any time. We recommend not sharing sensitive personal information publicly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate security measures to protect your personal information. However, no method 
                  of transmission over the Internet is 100% secure. We strive to protect your data but cannot guarantee 
                  absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use essential cookies to maintain your session and improve your experience. For more details, 
                  please see our Cookie Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed">
                  You can access, update, or delete your account information at any time. To request complete account 
                  deletion, contact us at hello@gazabridge.org.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:hello@gazabridge.org" className="text-emerald-600 hover:text-emerald-700">
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