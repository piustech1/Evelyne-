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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100]">
      <div className="relative w-full">
        {/* Curved background for center button - SVG Cutout */}
        <div className="absolute left-0 right-0 bottom-0 h-[70px] pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 70" preserveAspectRatio="none" className="drop-shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <path 
              d="M0,70 L0,10 L160,10 C175,10 175,0 185,0 L215,0 C225,0 225,10 240,10 L400,10 L400,70 Z" 
              fill="white" 
              stroke="#f1f5f9"
              strokeWidth="0.5"
            />
          </svg>
        </div>
        
        <nav className="relative h-[70px] flex items-center justify-between px-2 z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if (item.isSpecial) {
              return (
                <div key={item.name} className="relative flex flex-col items-center w-20 -mt-10">
                  <Link
                    to={item.path}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/40 hover:scale-110 active:scale-95 transition-all border-4 border-white relative z-20"
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-2xl" />
                  </Link>
                  <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isActive ? 'text-brand-purple' : 'text-gray-400'}`}>
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
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all mb-1 ${isActive ? 'text-brand-purple' : 'text-gray-400'}`}>
                  <FontAwesomeIcon icon={item.icon} className="text-lg" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-brand-purple' : 'text-gray-400'}`}>
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
