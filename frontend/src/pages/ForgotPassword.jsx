// frontend/src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forgetPasswordAPI } from '../api/forgetPassword';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await forgetPasswordAPI.requestReset(email);
      setSuccess(true);
    } catch (err) {
      const message = err.response?.data?.detail || 'Request failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background - Cream/Beige */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0E6] via-white to-[#E8E0D0]" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-md w-full"
      >
        {/* Logo - Centered with Image */}
        <div className="text-center mb-8">
          <div className="w-full mt-4">
            <Link to="/" className="inline-flex flex-col items-center justify-center mb-1 mx-auto">
              <div className="w-36 h-36 relative flex-shrink-0 mb-1 mx-auto">
                <img 
                  src="/assets/public/gazabrige.jpg" 
                  alt="GazaBridge Logo" 
                  className="w-full h-full object-contain rounded-2xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className="absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center"
                  style={{ 
                    display: 'none',
                    background: 'linear-gradient(135deg, #808000, #6b6b00)' 
                  }}
                >
                  <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
          
          <h2 className="text-3xl font-bold text-[#111100]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>Forgot your password?</h2>
          <p className="mt-2 text-[#555500]">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#808000]/10">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Success Message - Olive */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#808000] to-[#6b6b00] rounded-full flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-[#111100] mb-4" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>Check your email</h3>
              <p className="text-[#555500] mb-4">
                We've sent a password reset link to <span className="font-semibold text-[#111100]">{email}</span>
              </p>
              <p className="text-sm text-[#555500] mb-8">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => {
                    setSuccess(false);
                    setError('');
                  }}
                  className="text-[#808000] hover:text-[#6b6b00] font-semibold"
                >
                  try again
                </button>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[#808000] hover:text-[#6b6b00] font-semibold"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Login
              </Link>
            </motion.div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-semibold text-[#111100] mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-[#808000]/10 rounded-xl focus:ring-2 focus:ring-[#808000] focus:border-[#808000] transition-all outline-none text-[#111100] placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 bg-gradient-to-r from-[#808000] to-[#6b6b00] text-white font-semibold rounded-xl shadow-lg shadow-[#808000]/25 hover:shadow-[#808000]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending reset link...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </motion.button>

              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-[#555500] hover:text-[#808000] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}