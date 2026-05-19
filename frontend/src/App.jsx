// frontend/src/App.jsx - COMPLETE WITH ALL IMPORTS
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import PageTransition from './components/PageTransition';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { ResourceProvider } from './context/ResourceContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
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

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import GoogleRegister from './pages/GoogleRegister';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Dashboard Pages
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// App Pages
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Resources from './pages/Resources';
import Posts from './pages/Posts';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import OfferDetail from './pages/OfferDetail';
import LiveSections from './pages/LiveSections';
import LiveSectionDetail from './pages/LiveSectionDetail';
import Chat from './pages/Chat';

// Admin Pages
import AdminNotifications from './pages/AdminNotifications';
import AdminResources from './pages/admin/AdminResources';
import AdminPosts from './pages/admin/AdminPosts';
import AdminCourses from './pages/admin/AdminCourses';
import AdminLiveSections from './pages/admin/AdminLiveSections';
import AdminUserList from './pages/admin/AdminUserList';
import Unauthorized from './pages/Unauthorized';

// DashboardRedirect - inside AuthProvider context
function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  const isAdmin = user?.roles?.some(r => 
    typeof r === 'object' ? ['manager', 'admin', 'superuser'].includes(r.name) :
    ['manager', 'admin', 'superuser'].includes(r)
  ) || user?.is_staff || user?.is_superuser;

  return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
}

// AppRoutes - inside AuthProvider context
function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const publicPaths = [
    '/', '/how-it-works', '/services', '/faq', '/about', '/blog',
    '/mission', '/privacy-policy', '/terms-of-service', '/cookie-policy',
    '/login', '/register', '/auth/google/callback', '/google-register',
    '/forgot-password',
  ];

  const isPublicRoute = publicPaths.includes(location.pathname) ||
    location.pathname.startsWith('/blog/') ||
    location.pathname.startsWith('/forget-password/confirm/') ||
    location.pathname.startsWith('/users/verify-email/');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      {isPublicRoute && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300" />
        </div>
      )}
      
      {isPublicRoute && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Auth Routes (public) */}
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/auth/google/callback" element={<PageTransition><GoogleCallback /></PageTransition>} />
          <Route path="/google-register" element={<PageTransition><GoogleRegister /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/forget-password/confirm/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/users/verify-email/:token" element={<PageTransition><VerifyEmail /></PageTransition>} />

          {/* Dashboard Redirect */}
          <Route path="/dashboard-redirect" element={
            <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
          } />

          {/* Authenticated Routes with Sidebar Layout */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            {/* Normal User Dashboard */}
            <Route path="/dashboard" element={<PageTransition><UserDashboard /></PageTransition>} />
            
            {/* App Pages */}
            <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
            <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
            <Route path="/resources" element={<ResourceProvider><PageTransition><Resources /></PageTransition></ResourceProvider>} />
            <Route path="/posts" element={<PageTransition><Posts /></PageTransition>} />
            <Route path="/offers/:id" element={<PageTransition><OfferDetail /></PageTransition>} />
            <Route path="/courses" element={<PageTransition><Courses /></PageTransition>} />
            <Route path="/courses/:id" element={<PageTransition><CourseDetail /></PageTransition>} />
            <Route path="/live-sections" element={<PageTransition><LiveSections /></PageTransition>} />
            <Route path="/live-sections/:id" element={<PageTransition><LiveSectionDetail /></PageTransition>} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/unauthorized" element={<PageTransition><Unauthorized /></PageTransition>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><PageTransition><AdminDashboard /></PageTransition></AdminRoute>} />
            <Route path="/admin/notifications" element={<AdminRoute><PageTransition><AdminNotifications /></PageTransition></AdminRoute>} />
            <Route path="/admin/resources" element={<AdminRoute><PageTransition><AdminResources /></PageTransition></AdminRoute>} />
            <Route path="/admin/posts" element={<AdminRoute><PageTransition><AdminPosts /></PageTransition></AdminRoute>} />
            <Route path="/admin/courses" element={<AdminRoute><PageTransition><AdminCourses /></PageTransition></AdminRoute>} />
            <Route path="/admin/live-sections" element={<AdminRoute><PageTransition><AdminLiveSections /></PageTransition></AdminRoute>} />
            
            {/* Admin User Management */}
            <Route path="/admin/users/:role" element={<AdminRoute><PageTransition><AdminUserList /></PageTransition></AdminRoute>} />
          </Route>

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
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {isPublicRoute && <Footer />}
      {isPublicRoute && <ScrollToTop />}
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <AuthProvider>
      <UserProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </UserProvider>
    </AuthProvider>
  );
}