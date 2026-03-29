import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faRocket, faHistory, faUser, faWallet, faStar } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { name: 'Picks', path: '/recommended', icon: faStar },
    { name: 'Orders', path: '/orders', icon: faHistory },
    { name: 'Boost', path: '/boost', icon: faRocket, isSpecial: true },
    { name: 'Wallet', path: '/wallet', icon: faWallet },
    { name: 'Profile', path: '/profile', icon: faUser },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100]">
      <div className="relative">
        {/* Cut-out background */}
        <div className="absolute inset-0 h-[70px] bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]" />
        
        {/* SVG Cut-out for the center button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-20 h-20 bg-white rounded-full border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]" />

        <nav className="relative h-[70px] flex items-center justify-between px-4 z-10">
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            
            if (item.isSpecial) {
              return (
                <div key={item.name} className="relative flex flex-col items-center w-20">
                  <Link
                    to={item.path}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/40 hover:scale-110 active:scale-95 transition-all border-4 border-white -mt-12 relative z-20"
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
                className="flex-1 flex flex-col items-center py-2 transition-all active-press"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all mb-1 ${isActive ? 'text-brand-purple' : 'text-gray-400'}`}>
                  <FontAwesomeIcon icon={item.icon} className="text-base" />
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
