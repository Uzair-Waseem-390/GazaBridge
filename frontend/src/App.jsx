// frontend/src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import PageTransition from './components/PageTransition';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Services from './pages/Services';
import FAQ from './pages/FAQ';
import AboutUs from './pages/AboutUs';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Mission from './pages/Mission';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import GoogleRegister from './pages/GoogleRegister';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminNotifications from './pages/AdminNotifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    const currentProgress = (window.scrollY / totalScroll) * 100;
    setScrollProgress(currentProgress);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <UserProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
            <Navbar />
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Auth Routes */}
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
                <Route path="/auth/google/callback" element={<PageTransition><GoogleCallback /></PageTransition>} />
                <Route path="/google-register" element={<PageTransition><GoogleRegister /></PageTransition>} />
                <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
                <Route path="/forget-password/confirm/:token" element={<PageTransition><ResetPassword /></PageTransition>} />

                {/* User Routes */}
                <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
                <Route path="/users/verify-email/:token" element={<PageTransition><VerifyEmail /></PageTransition>} />

                {/* Notification Routes */}
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <PageTransition><Notifications /></PageTransition>
                  </ProtectedRoute>
                } />
                <Route path="/admin/notifications" element={
                  <ProtectedRoute>
                    <PageTransition><AdminNotifications /></PageTransition>
                  </ProtectedRoute>
                } />

                {/* Public Routes */}
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/how-it-works" element={<PageTransition><HowItWorks /></PageTransition>} />
                <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
                <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
                <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
                <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
                <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
                <Route path="/mission" element={<PageTransition><Mission /></PageTransition>} />
                <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
                <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
                <Route path="/cookie-policy" element={<PageTransition><CookiePolicy /></PageTransition>} />
              </Routes>
            </AnimatePresence>
            <Footer />
            <ScrollToTop />
          </div>
        </NotificationProvider>
      </UserProvider>
    </AuthProvider>
  );
}