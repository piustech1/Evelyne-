import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

export default function AdminLayout() {
  const isAdminLoggedIn = localStorage.getItem('adminUser');

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="min-h-screen bg-brand-light flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminTopbar />
        <main className="flex-grow p-10 mt-20 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
