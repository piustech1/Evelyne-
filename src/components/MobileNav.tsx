import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faRocket, faHistory, faUser, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: faHome },
    { name: 'Services', path: '/services', icon: faThLarge },
    { name: 'Boost', path: '/services', icon: faRocket, isSpecial: true },
    { name: 'Orders', path: '/orders', icon: faHistory },
    { name: 'Profile', path: '/profile', icon: faUser },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-lg border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe">
      {/* Curved background for center button */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-20 h-10 bg-white border-t border-x border-gray-100 rounded-t-full z-0" />
      
      <div className="flex justify-around items-center h-14 px-2 relative z-10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isSpecial) {
            return (
              <div key={item.name} className="relative -top-5 flex flex-col items-center">
                <Link
                  to={item.path}
                  className="flex items-center justify-center w-12 h-12 rounded-full gradient-brand shadow-sm text-white transform transition-all active:scale-90 hover:scale-105 border-4 border-white"
                >
                  <FontAwesomeIcon icon={item.icon} className="text-lg" />
                </Link>
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-purple mt-1">{item.name}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-12 h-full space-y-1 transition-all group ${
                isActive ? 'text-brand-purple' : 'text-gray-400'
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={`text-sm transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                />
                <span className="text-[8px] font-black uppercase tracking-widest mt-1">{item.name}</span>
              </motion.div>
              
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-4 h-0.5 gradient-brand rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
