import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faBars, faTimes, faUserCircle, faWallet, faHistory, faChartLine, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { name: 'Boost', path: '/boost', icon: faRocket },
    { name: 'Dashboard', path: '/dashboard', icon: faChartLine },
    { name: 'Orders', path: '/orders', icon: faHistory },
    { name: 'Wallet', path: '/wallet', icon: faWallet },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-md py-2' : 'bg-gradient-to-r from-blue-500 to-purple-500 py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faRocket} className="text-blue-600 text-sm" />
            </div>
            <span className="text-lg font-display font-black tracking-tighter text-white">
              Easy<span className="text-white/80">Boost</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user && navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 text-white/90 hover:text-white hover:bg-white/10"
              >
                <FontAwesomeIcon icon={link.icon} className="text-[7px]" />
                <span>{link.name}</span>
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/20">
                <div className="text-right hidden lg:block">
                  <div className="text-[7px] font-black uppercase tracking-widest text-white/60">Balance</div>
                  <div className="text-[10px] font-black text-white">UGX {userData?.balance?.toLocaleString() || 0}</div>
                </div>
                <Link to="/profile" className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-all bg-white/10 text-white hover:bg-white/20">
                  <img 
                    src="https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-white/10 text-white hover:bg-rose-500 hover:text-white"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-sm" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-[9px] font-black uppercase tracking-widest transition-colors text-white/80 hover:text-white">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 bg-white text-blue-600 font-black text-[9px] uppercase tracking-widest rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {user && (
              <div className="text-right">
                <div className="text-[7px] font-black uppercase tracking-widest text-white/60">Balance</div>
                <div className="text-[10px] font-black text-white">UGX {userData?.balance?.toLocaleString() || 0}</div>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-white/10 text-white"
            >
              <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {user && navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-brand-purple transition-colors"
                >
                  <FontAwesomeIcon icon={link.icon} className="text-[8px]" />
                  <span>{link.name}</span>
                </Link>
              ))}
              {!user ? (
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center px-4 py-3 rounded-xl border border-gray-100 text-gray-500 font-black uppercase tracking-widest text-[9px]"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center px-4 py-3 rounded-xl gradient-brand text-white font-black uppercase tracking-widest text-[9px] shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-[8px]" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
