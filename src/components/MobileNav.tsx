import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faRocket, faHistory, faUser, faWallet } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: faHome },
    { name: 'Orders', path: '/orders', icon: faHistory },
    { name: 'Boost', path: '/boost', icon: faRocket, isSpecial: true },
    { name: 'Wallet', path: '/wallet', icon: faWallet },
    { name: 'Profile', path: '/profile', icon: faUser },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] pb-safe">
      {/* Curved background for center button */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-24 h-12 bg-white border-t border-x border-gray-100 rounded-t-[40px] z-0 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]" />
      
      <div className="flex justify-around items-end h-16 px-2 relative z-10 pb-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isSpecial) {
            return (
              <div key={item.name} className="relative -top-8 flex flex-col items-center">
                <Link
                  to={item.path}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-600/30 text-white transform transition-all active:scale-90 hover:scale-110 border-4 border-white"
                >
                  <FontAwesomeIcon icon={item.icon} className="text-xl" />
                </Link>
                <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${isActive ? 'text-brand-purple' : 'text-gray-400'}`}>{item.name}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-14 h-full space-y-1 transition-all group ${
                isActive ? 'text-brand-purple' : 'text-gray-400'
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={`text-base transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                />
                <span className="text-[9px] font-black uppercase tracking-widest mt-1">{item.name}</span>
              </motion.div>
              
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-5 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
