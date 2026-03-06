/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import PlatformPage from './pages/PlatformPage';
import Boost from './pages/Boost';
import OrderPage from './pages/OrderPage';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminServices from './pages/admin/Services';
import AdminCategories from './pages/admin/Categories';
import AdminPayments from './pages/admin/Payments';
import AdminProviders from './pages/admin/Providers';
import AdminTickets from './pages/admin/Tickets';
import AdminReports from './pages/admin/Reports';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminSettings from './pages/admin/Settings';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollToTop />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* User Routes */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col bg-white">
              <Navbar isLoggedIn={!!user} />
              
              <main className="flex-grow pt-16 md:pt-20">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
                  <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                  <Route path="/services" element={user ? <Services /> : <Navigate to="/login" />} />
                  <Route path="/platform" element={user ? <PlatformPage /> : <Navigate to="/login" />} />
                  <Route path="/boost" element={user ? <Boost /> : <Navigate to="/login" />} />
                  <Route path="/order" element={user ? <OrderPage /> : <Navigate to="/login" />} />
                  <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" />} />
                  <Route path="/wallet" element={user ? <Wallet /> : <Navigate to="/login" />} />
                  <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                  <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
                </Routes>
              </main>

              {user && <MobileNav />}
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
