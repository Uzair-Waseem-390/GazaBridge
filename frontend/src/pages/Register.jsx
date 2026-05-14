// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usersAPI } from '../api/users';
import GoogleLoginButton from '../components/GoogleLoginButton';

const COUNTRIES = [
  // Middle East & North Africa
  'Palestine', 'Egypt', 'Jordan', 'Lebanon', 'Syria', 'Saudi Arabia',
  'UAE', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 'Yemen', 'Iraq',
  'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Sudan', 'Somalia',
  'Mauritania', 'Djibouti', 'Comoros',
  // Asia
  'Turkey', 'Pakistan', 'Afghanistan', 'Bangladesh', 'India', 'Indonesia',
  'Malaysia', 'Iran', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan',
  'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'China', 'Japan',
  'South Korea', 'Philippines', 'Thailand', 'Vietnam',
  // Europe
  'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Belgium', 'Switzerland',
  'Austria', 'Poland', 'Portugal', 'Greece', 'Ireland',
  // Americas
  'United States', 'Canada', 'Brazil', 'Argentina', 'Mexico',
  'Colombia', 'Chile', 'Venezuela',
  // Africa (Sub-Saharan)
  'Nigeria', 'Ethiopia', 'Kenya', 'Ghana', 'Senegal', 'Mali',
  'Niger', 'Chad', 'Cameroon', 'Tanzania', 'Uganda', 'South Africa',
  // Oceania
  'Australia', 'New Zealand',
  'Other'
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const LANGUAGES = [
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ja', label: 'Japanese' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'es', label: 'Spanish' },
  { code: 'tr', label: 'Turkish' },
  { code: 'ur', label: 'Urdu' },
];

const ROLES = [
  { value: 'volunteer', label: '🧑‍🏫 I want to volunteer and teach', description: 'Share your skills with eager learners' },
  { value: 'seeker', label: '🎓 I want to learn new skills', description: 'Get help from experienced volunteers' },
];

const STEPS = ['Account', 'Profile', 'Verification'];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    country: '',
    gender: '',
    linkedin: '',
    roles: [],
    languages: [],
    whatsapp_number: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.email || !formData.password) {
          setError('Please fill in all required fields.');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters.');
          return false;
        }
        return true;
      case 2:
        if (!formData.first_name || !formData.last_name || !formData.country || 
            !formData.gender || !formData.linkedin || formData.roles.length === 0) {
          setError('Please fill in all required fields.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;

    setLoading(true);
    setError('');

    try {
      const response = await usersAPI.register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        country: formData.country,
        gender: formData.gender,
        linkedin: formData.linkedin,
        roles: formData.roles,
        languages: formData.languages,
        whatsapp_number: formData.whatsapp_number,
      });

      setSuccessMessage(response.data.message);
      setStep(3);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        // Handle nested errors
        const messages = [];
        Object.entries(errorData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            messages.push(...value);
          } else if (typeof value === 'string') {
            messages.push(value);
          }
        });
        setError(messages.join('\n') || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
            placeholder="At least 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
            placeholder="Repeat your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            value={formData.first_name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            value={formData.last_name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          I want to... <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {ROLES.map((role) => (
            <label
              key={role.value}
              className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.roles.includes(role.value)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                name="roles"
                value={role.value}
                checked={formData.roles.includes(role.value)}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{role.label}</div>
                <div className="text-sm text-gray-500">{role.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
          Country <span className="text-red-500">*</span>
        </label>
        <select
          id="country"
          name="country"
          required
          value={formData.country}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
        >
          <option value="">Select your country</option>
          {COUNTRIES.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
          Gender <span className="text-red-500">*</span>
        </label>
        <select
          id="gender"
          name="gender"
          required
          value={formData.gender}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
        >
          <option value="">Select gender</option>
          {GENDERS.map(gender => (
            <option key={gender.value} value={gender.value}>{gender.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
          LinkedIn Profile <span className="text-red-500">*</span>
        </label>
        <input
          id="linkedin"
          name="linkedin"
          type="url"
          required
          value={formData.linkedin}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/yourprofile"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Languages you speak
        </label>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map(language => (
            <label
              key={language.code}
              className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${
                formData.languages.includes(language.code)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                name="languages"
                value={language.code}
                checked={formData.languages.includes(language.code)}
                onChange={handleChange}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{language.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp Number <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="whatsapp_number"
          name="whatsapp_number"
          type="tel"
          value={formData.whatsapp_number}
          onChange={handleChange}
          placeholder="+1234567890"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
        />
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
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
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h3>
      <p className="text-gray-600 mb-6">
        {successMessage || 'We\'ve sent a verification link to your email address. Please verify your email to activate your account.'}
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Didn't receive the email? Check your spam folder or{' '}
        <button
          onClick={() => usersAPI.resendVerification(formData.email)}
          className="text-emerald-600 hover:text-emerald-700 font-semibold"
        >
          click here to resend
        </button>
      </p>
      <Link
        to="/login"
        className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        Go to Login
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl rotate-12" />
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              GazaBridge
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">Join our community of learners and volunteers</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Progress Steps */}
          {step < 3 && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {STEPS.map((stepName, index) => (
                  <div key={stepName} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      index + 1 <= step
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1 < step ? '✓' : index + 1}
                    </div>
                    <span className={`ml-2 text-sm font-medium hidden sm:block ${
                      index + 1 <= step ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      {stepName}
                    </span>
                    {index < STEPS.length - 1 && (
                      <div className={`w-12 sm:w-20 h-0.5 mx-2 ${
                        index + 1 < step ? 'bg-emerald-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Sign Up */}
          {step === 1 && (
            <>
              <GoogleLoginButton className="mb-6" />
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or continue with email</span>
                </div>
              </div>
            </>
          )}

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
                <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation Buttons */}
            {step < 3 && (
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <motion.button
                    type="button"
                    onClick={handleBack}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </motion.button>
                )}
                {step < 2 ? (
                  <motion.button
                    type="button"
                    onClick={handleNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                  >
                    Continue
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </motion.button>
                )}
              </div>
            )}
          </form>
        </div>

        {step < 3 && (
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign in
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}