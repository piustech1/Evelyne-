import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faBars, faTimes, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface NavbarProps {
  isLoggedIn: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { name: 'Home', path: isLoggedIn ? '/dashboard' : '/' },
    { name: 'Services', path: '/services' },
    { name: 'Orders', path: '/orders', protected: true },
    { name: 'Wallet', path: '/wallet', protected: true },
  ];

  const filteredLinks = navLinks.filter(link => !link.protected || isLoggedIn);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faRocket} className="text-white text-base" />
            </div>
            <span className="text-xl font-display font-black text-white tracking-tighter">
              Easy<span className="text-brand-purple">Boost</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-white/10">
                <Link to="/profile" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-brand-purple transition-all">
                  <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl bg-white/5 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 gradient-brand text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-brand-blue/20 hover:scale-105 transition-transform"
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
              className="text-gray-400 p-2 focus:outline-none"
            >
              <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="text-xl" />
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
            className="md:hidden bg-brand-dark border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {!isLoggedIn && (
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center px-4 py-3 rounded-xl border border-white/10 text-gray-400 font-black uppercase tracking-widest text-[10px]"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center px-4 py-3 rounded-xl gradient-brand text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-blue/20"
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
