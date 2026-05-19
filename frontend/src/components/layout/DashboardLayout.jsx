// frontend/src/components/layout/DashboardLayout.jsx - FIXED
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import HeaderBar from './HeaderBar';

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // FIXED: Check admin status - roles are strings from backend
  const adminRoles = ['manager', 'admin', 'superuser'];
  const isAdmin = user?.roles?.some(r => adminRoles.includes(r)) || 
                  user?.is_staff || 
                  user?.is_superuser;

  console.log('DashboardLayout - User:', user?.email);
  console.log('DashboardLayout - Roles:', user?.roles);
  console.log('DashboardLayout - Is Admin:', isAdmin);

  const isChatPage = location.pathname === '/chat';

  if (isChatPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <HeaderBar />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-64 lg:w-72 bg-white border-r border-gray-200 flex-shrink-0 h-screen sticky top-0 overflow-y-auto z-30"
          >
            {isAdmin ? <AdminSidebar /> : <Sidebar />}
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}