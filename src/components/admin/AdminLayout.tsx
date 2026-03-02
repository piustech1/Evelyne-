import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAdminLoggedIn = localStorage.getItem('adminUser');

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="min-h-screen bg-brand-light flex relative overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden backdrop-blur-sm transition-opacity"
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
