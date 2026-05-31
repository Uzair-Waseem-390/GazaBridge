// frontend/src/pages/GoogleRegister.jsx
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

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
  { value: 'volunteer', label: '🧑‍🏫 Volunteer - I want to teach', description: 'Share your skills with learners' },
  { value: 'seeker', label: '🎓 Seeker - I want to learn', description: 'Learn new digital skills' },
];

export default function GoogleRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const { googleRegister } = useAuth();

  const { registrationToken, user: googleUser } = location.state || {};

  const [formData, setFormData] = useState({
    country: '',
    gender: '',
    linkedin: '',
    roles: [],
    languages: [],
    whatsapp_number: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if no registration token
  if (!registrationToken) {
    navigate('/login', { replace: true });
    return null;
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.roles.length === 0) {
      setError('Please select at least one role.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await googleRegister({
      registration_token: registrationToken,
      ...formData,
    });

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

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
          <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-gray-600">
            Welcome{googleUser?.first_name ? `, ${googleUser.first_name}` : ''}! Let's set up your account.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Roles */}
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

            {/* Country */}
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

            {/* Gender */}
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

            {/* LinkedIn */}
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

            {/* Languages */}
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

            {/* WhatsApp */}
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

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </div>
              ) :ئ (
                'Complete Registration'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}