// frontend/src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forgetPasswordAPI } from '../api/forgetPassword';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [passwords, setPasswords] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setPasswords(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (passwords.new_password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (passwords.new_password !== passwords.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await forgetPasswordAPI.confirmReset(token, passwords);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const message = err.response?.data?.detail || 
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.confirm_password?.[0] ||
        'Password reset failed. The link may be invalid or expired.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl rotate-12" />
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              GazaBridge
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Set new password</h2>
          <p className="mt-2 text-gray-600">
            Your new password must be different from previously used passwords.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Password reset successful!</h3>
              <p className="text-gray-600 mb-4">
                Your password has been successfully reset. You'll be redirected to the login page shortly.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6 overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                />
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Go to Login Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          )}

          {!success && (
            <>
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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    required
                    minLength={8}
                    value={passwords.new_password}
                    onChange={handleChange}
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                    placeholder="At least 8 characters"
                  />
                  {passwords.new_password && (
                    <PasswordStrengthIndicator password={passwords.new_password} />
                  )}
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    required
                    value={passwords.confirm_password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-gray-900 placeholder-gray-400 ${
                      passwords.confirm_password && passwords.new_password !== passwords.confirm_password
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder="Repeat your new password"
                  />
                  {passwords.confirm_password && passwords.new_password !== passwords.confirm_password && (
                    <p className="mt-2 text-sm text-red-600">Passwords do not match</p>
                  )}
                  {passwords.confirm_password && passwords.new_password === passwords.confirm_password && (
                    <p className="mt-2 text-sm text-emerald-600">✓ Passwords match</p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Password requirements:</h4>
                  <ul className="space-y-2">
                    {[
                      { label: 'At least 8 characters', met: passwords.new_password.length >= 8 },
                      { label: 'Contains uppercase letter', met: /[A-Z]/.test(passwords.new_password) },
                      { label: 'Contains lowercase letter', met: /[a-z]/.test(passwords.new_password) },
                      { label: 'Contains a number', met: /[0-9]/.test(passwords.new_password) },
                      { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new_password) },
                    ].map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <svg
                          className={`w-4 h-4 flex-shrink-0 ${
                            passwords.new_password
                              ? req.met
                                ? 'text-emerald-500'
                                : 'text-gray-300'
                              : 'text-gray-300'
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={req.met && passwords.new_password ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01'}
                          />
                        </svg>
                        <span className={passwords.new_password ? (req.met ? 'text-emerald-700' : 'text-gray-500') : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || passwords.new_password !== passwords.confirm_password}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Resetting password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </form>
            </>
          )}
        </div>

        {!success && (
          <p className="text-center mt-6 text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign in
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}