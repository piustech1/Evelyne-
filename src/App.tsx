/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import PlatformPage from './pages/PlatformPage';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock login check
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setIsLoggedIn(true);
  }, []);

  return (
    <Router>
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
            <div className="min-h-screen flex flex-col bg-brand-light">
              <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
              
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                  <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
                  <Route path="/services" element={isLoggedIn ? <Services /> : <Navigate to="/login" />} />
                  <Route path="/services/:platform" element={isLoggedIn ? <PlatformPage /> : <Navigate to="/login" />} />
                  <Route path="/orders" element={isLoggedIn ? <Orders /> : <Navigate to="/login" />} />
                  <Route path="/wallet" element={isLoggedIn ? <Wallet /> : <Navigate to="/login" />} />
                  <Route path="/profile" element={isLoggedIn ? <Profile setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/login" />} />
                </Routes>
              </main>

              {isLoggedIn && <MobileNav />}
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
