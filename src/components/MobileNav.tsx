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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe rounded-t-[2rem]">
      <div className="flex justify-around items-center h-20 px-2 relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isSpecial) {
            return (
              <div key={item.name} className="relative -top-8 flex flex-col items-center">
                <Link
                  to={item.path}
                  className="flex items-center justify-center w-16 h-16 rounded-full gradient-brand shadow-lg shadow-brand-orange/30 text-white transform transition-all active:scale-90 hover:scale-105"
                >
                  <FontAwesomeIcon icon={item.icon} className="text-2xl" />
                </Link>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange mt-2">{item.name}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-14 h-full space-y-1 transition-all group ${
                isActive ? 'text-brand-orange' : 'text-gray-400'
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={`text-lg transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{item.name}</span>
              </motion.div>
              
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-6 h-1 gradient-brand rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
