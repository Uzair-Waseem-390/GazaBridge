// frontend/src/pages/GoogleCallback.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    // Guard: only run once even if dependencies change
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Google authentication was cancelled or failed.');
        setProcessing(false);
        return;
      }

      if (!code) {
        setError('No authorization code received from Google.');
        setProcessing(false);
        return;
      }

      const redirectUri = sessionStorage.getItem('google_redirect_uri') || 
                          `${window.location.origin}/auth/google/callback`;

      const result = await googleLogin(code, redirectUri);

      if (result.success) {
        if (result.isNewUser) {
          navigate('/google-register', {
            state: {
              registrationToken: result.registrationToken,
              user: result.user,
            },
            replace: true,
          });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError(result.error);
        setProcessing(false);
      }
    };

    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (processing && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing authentication</h2>
          <p className="text-gray-600">Please wait while we sign you in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}