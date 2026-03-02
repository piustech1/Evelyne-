import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
}

export default function Navbar({ isLoggedIn, setIsLoggedIn }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: isLoggedIn ? '/dashboard' : '/' },
    { name: 'Services', path: '/#services' },
    { name: 'Orders', path: '/orders', protected: true },
    { name: 'Wallet', path: '/wallet', protected: true },
  ];

  const filteredLinks = navLinks.filter(link => !link.protected || isLoggedIn);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 gradient-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand-orange/20 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faRocket} className="text-white text-xl" />
            </div>
            <span className="text-2xl font-display font-black text-brand-dark tracking-tighter">
              Easy<span className="text-brand-orange">Boost</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {filteredLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-500 hover:text-brand-orange font-bold text-sm uppercase tracking-widest transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-6">
                <Link to="/profile" className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all shadow-sm">
                  <FontAwesomeIcon icon={faRocket} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 rounded-2xl bg-brand-dark text-white font-bold text-sm uppercase tracking-widest hover:bg-brand-orange transition-all shadow-lg shadow-brand-dark/10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to="/login" className="text-gray-500 font-bold text-sm uppercase tracking-widest hover:text-brand-orange transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-8 py-3.5 gradient-brand text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-orange/30 hover:scale-105 transition-transform"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 p-2 focus:outline-none"
            >
              <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="text-2xl" />
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
            <div className="px-4 pt-4 pb-8 space-y-3">
              {filteredLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:bg-brand-light hover:text-brand-orange transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {!isLoggedIn && (
                <div className="pt-6 grid grid-cols-2 gap-4">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center px-4 py-4 rounded-2xl border border-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center px-4 py-4 rounded-2xl gradient-brand text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-orange/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
