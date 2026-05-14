// frontend/src/pages/TermsOfService.jsx
import { motion } from 'framer-motion';

export default function TermsOfService() {
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
              Terms of <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-gray-500 mb-12">Last updated: December 2024</p>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using GazaBridge, you agree to be bound by these Terms of Service. If you do not 
                  agree, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Platform Purpose</h2>
                <p className="text-gray-600 leading-relaxed">
                  GazaBridge is a free platform connecting volunteers with individuals seeking to learn digital skills. 
                  All services provided through the platform are free of charge. We do not facilitate any financial 
                  transactions between users.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Conduct</h2>
                <p className="text-gray-600 leading-relaxed">
                  Users agree to interact respectfully and professionally. Harassment, discrimination, spam, or any 
                  form of abuse will result in immediate account termination. Users must not misuse the platform for 
                  commercial solicitation or political campaigning.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Volunteer Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  Volunteers agree to provide services free of charge. Volunteers must not solicit payment from 
                  seekers. Any attempt to charge for services will result in account removal.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Content</h2>
                <p className="text-gray-600 leading-relaxed">
                  Users are responsible for the content they post. We reserve the right to remove any content that 
                  violates these terms. Users grant GazaBridge a license to display content posted on the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  GazaBridge is provided "as is" without warranties. We are not liable for interactions between 
                  users or any damages arising from platform use. Users engage with each other at their own risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Account Termination</h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these terms. Users may delete 
                  their accounts at any time by contacting us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
                <p className="text-gray-600 leading-relaxed">
                  For questions about these Terms, contact us at{' '}
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