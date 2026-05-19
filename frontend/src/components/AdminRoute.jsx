// frontend/src/components/AdminRoute.jsx - FIXED
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // FIXED: Check roles as strings (how backend sends them)
  const adminRoles = ['manager', 'admin', 'superuser'];
  const hasAdminRole = user?.roles?.some(r => adminRoles.includes(r));
  const isAdmin = hasAdminRole || user?.is_staff || user?.is_superuser;

  console.log('AdminRoute check - User:', user?.email);
  console.log('AdminRoute check - Roles:', user?.roles);
  console.log('AdminRoute check - Has admin role:', hasAdminRole);
  console.log('AdminRoute check - Is admin:', isAdmin);

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}