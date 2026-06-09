// frontend/src/components/layout/DashboardLayout.jsx - FIXED
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
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
      <div className="min-h-screen bg-[#EDE8DC]/40">
        <HeaderBar variant="dashboard" />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE8DC]/40 flex text-[#3F3A32]">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-64 lg:w-72 bg-white/50 backdrop-blur-md border-r border-[#D9D0BD]/70 flex-shrink-0 h-screen sticky top-0 overflow-y-auto z-30"
          >
            {isAdmin ? <AdminSidebar /> : <Sidebar />}
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar
          variant="dashboard"
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
