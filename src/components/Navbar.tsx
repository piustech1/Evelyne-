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
    { name: 'Services', path: '/services', icon: faRocket },
    { name: 'Dashboard', path: '/dashboard', icon: faChartLine },
    { name: 'Orders', path: '/orders', icon: faHistory },
    { name: 'Wallet', path: '/wallet', icon: faWallet },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm py-2' : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faRocket} className="text-white text-sm" />
            </div>
            <span className={`text-lg font-display font-black tracking-tighter transition-colors ${
              isScrolled ? 'text-brand-light' : 'text-white'
            }`}>
              Easy<span className="text-brand-purple">Boost</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user && navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${
                  isScrolled 
                    ? 'text-gray-500 hover:text-brand-purple hover:bg-brand-purple/5' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <FontAwesomeIcon icon={link.icon} className="text-[7px]" />
                <span>{link.name}</span>
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200/20">
                <div className="text-right hidden lg:block">
                  <div className={`text-[7px] font-black uppercase tracking-widest ${isScrolled ? 'text-gray-400' : 'text-white/50'}`}>Balance</div>
                  <div className={`text-[10px] font-black ${isScrolled ? 'text-brand-purple' : 'text-white'}`}>UGX {userData?.balance?.toLocaleString() || 0}</div>
                </div>
                <Link to="/profile" className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isScrolled ? 'bg-gray-50 text-gray-400 hover:text-brand-purple' : 'bg-white/10 text-white/70 hover:text-white'
                }`}>
                  <FontAwesomeIcon icon={faUserCircle} className="text-lg" />
                </Link>
                <button
                  onClick={handleLogout}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isScrolled 
                      ? 'bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50' 
                      : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-sm" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isScrolled ? 'text-gray-500 hover:text-brand-purple' : 'text-white/70 hover:text-white'}`}>
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 gradient-brand text-white font-black text-[9px] uppercase tracking-widest rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all"
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
                <div className={`text-[7px] font-black uppercase tracking-widest ${isScrolled ? 'text-gray-400' : 'text-white/50'}`}>Balance</div>
                <div className={`text-[10px] font-black ${isScrolled ? 'text-brand-purple' : 'text-white'}`}>UGX {userData?.balance?.toLocaleString() || 0}</div>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isScrolled ? 'bg-gray-50 text-brand-light' : 'bg-white/10 text-white'
              }`}
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
