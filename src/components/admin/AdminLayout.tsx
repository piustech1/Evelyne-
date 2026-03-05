import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-gray-900 font-black uppercase tracking-widest animate-pulse">Verifying Admin Access...</div>
      </div>
    );
  }

  // Check if user is logged in AND is an admin
  const isAdmin = userData?.isAdmin === true || user?.email === 'piustech@gmail.com';

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex relative overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[55] lg:hidden backdrop-blur-md transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-h-screen w-full lg:ml-64">
        <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-grow p-4 md:p-8 lg:p-10 mt-20 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
