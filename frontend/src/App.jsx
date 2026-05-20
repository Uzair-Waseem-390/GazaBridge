// frontend/src/App.jsx - Complete with fixed showPublicLayout logic
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

// Helper function to check if user is admin
function checkIsAdmin(user) {
  const adminRoles = ['manager', 'admin', 'superuser'];
  return user?.roles?.some(r => adminRoles.includes(r)) || 
         user?.is_staff || 
         user?.is_superuser;
}

// Handle root path based on auth status
function HomeRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    const isAdmin = checkIsAdmin(user);
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  // Not authenticated - show landing page
  return <PageTransition><Home /></PageTransition>;
}

// Protect public routes from authenticated users
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (isAuthenticated && user) {
    const isAdmin = checkIsAdmin(user);
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}

// DashboardRedirect - inside AuthProvider context
function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  const isAdmin = checkIsAdmin(user);

  console.log('DashboardRedirect - User:', user?.email);
  console.log('DashboardRedirect - Roles:', user?.roles);
  console.log('DashboardRedirect - Is Admin:', isAdmin);

  return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
}

// AppRoutes - inside AuthProvider context
function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Public paths that are ALWAYS accessible with Navbar (even when logged in)
  const alwaysPublicPaths = [
    '/privacy-policy', '/terms-of-service', '/cookie-policy',
  ];

  // Auth paths - redirect to dashboard if already authenticated
  const authPaths = [
    '/login', '/register', '/forgot-password',
  ];

  // Landing page and informational pages - always show Navbar
  const infoPaths = [
    '/', '/how-it-works', '/services', '/faq', '/about', '/mission',
    '/blog',  // Added /blog here explicitly
  ];

  // Check if current path starts with certain patterns
  const isAlwaysPublic = alwaysPublicPaths.includes(location.pathname) ||
    location.pathname.startsWith('/users/verify-email/') ||
    location.pathname.startsWith('/forget-password/confirm/');

  const isAuthPath = authPaths.includes(location.pathname) ||
    location.pathname.startsWith('/auth/google/') ||
    location.pathname.startsWith('/google-register');

  const isInfoPath = infoPaths.includes(location.pathname) ||
    location.pathname.startsWith('/blog/');  // This catches /blog/:slug

  const isLandingPage = location.pathname === '/';

  // FIXED: Show Navbar + Footer for:
  // 1. Always-public pages (legal docs, verification)
  // 2. Info pages (how-it-works, services, faq, about, mission, blog)
  // 3. Landing page (when not authenticated, or always show it)
  // 4. Auth pages (when not authenticated)
  const showPublicLayout = 
    isAlwaysPublic ||
    isInfoPath ||
    isLandingPage ||
    (!isAuthenticated && isAuthPath);

  // Debug log
  console.log('Path:', location.pathname);
  console.log('showPublicLayout:', showPublicLayout);
  console.log('isAlwaysPublic:', isAlwaysPublic);
  console.log('isInfoPath:', isInfoPath);
  console.log('isAuthPath:', isAuthPath);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      {showPublicLayout && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300" />
        </div>
      )}
      
      {showPublicLayout && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Auth Routes */}
          <Route path="/login" element={
            <PublicOnlyRoute><PageTransition><Login /></PageTransition></PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute><PageTransition><Register /></PageTransition></PublicOnlyRoute>
          } />
          <Route path="/auth/google/callback" element={<PageTransition><GoogleCallback /></PageTransition>} />
          <Route path="/google-register" element={<PageTransition><GoogleRegister /></PageTransition>} />
          <Route path="/forgot-password" element={
            <PublicOnlyRoute><PageTransition><ForgotPassword /></PageTransition></PublicOnlyRoute>
          } />
          <Route path="/forget-password/confirm/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/users/verify-email/:token" element={<PageTransition><VerifyEmail /></PageTransition>} />

          {/* Dashboard Redirect */}
          <Route path="/dashboard-redirect" element={
            <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
          } />

          {/* Authenticated Routes with Sidebar Layout */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<PageTransition><UserDashboard /></PageTransition>} />
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
            <Route path="/admin/users/:role" element={<AdminRoute><PageTransition><AdminUserList /></PageTransition></AdminRoute>} />
          </Route>

          {/* Root path */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Public informational pages (always accessible with Navbar) */}
          <Route path="/how-it-works" element={<PageTransition><HowItWorks /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
          <Route path="/mission" element={<PageTransition><Mission /></PageTransition>} />
          
          {/* Always public legal pages */}
          <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
          <Route path="/cookie-policy" element={<PageTransition><CookiePolicy /></PageTransition>} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {showPublicLayout && <Footer />}
      {showPublicLayout && <ScrollToTop />}
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