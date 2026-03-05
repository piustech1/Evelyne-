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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4">
      <div className="relative max-w-lg mx-auto">
        {/* Curved background for center button - Smoother and lower */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-20 h-10 bg-white z-0 rounded-t-[2rem] border-t border-gray-100" />
        
        <nav className="bg-white rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border border-gray-100 px-2 py-3 flex items-center justify-between relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if (item.isSpecial) {
              return (
                <div key={item.name} className="relative flex flex-col items-center w-16">
                  <Link
                    to={item.path}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 hover:scale-110 active:scale-95 transition-all border-4 border-white relative z-20 -mt-8"
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                  </Link>
                  <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isActive ? 'text-brand-purple' : 'text-gray-400'}`}>
                    {item.name}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex-1 flex flex-col items-center py-1 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all mb-1 ${isActive ? 'bg-brand-purple/10 text-brand-purple' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  <FontAwesomeIcon icon={item.icon} className="text-lg" />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-brand-purple' : 'text-gray-400'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
