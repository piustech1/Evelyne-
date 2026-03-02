import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faThLarge, 
  faShoppingCart, 
  faUsers, 
  faList, 
  faTags, 
  faMoneyBillWave, 
  faPlug, 
  faTicketAlt, 
  faChartBar, 
  faBullhorn, 
  faCog, 
  faSignOutAlt,
  faRocket
} from '@fortawesome/free-solid-svg-icons';

const menuItems = [
  { name: 'Dashboard', icon: faThLarge, path: '/admin/dashboard' },
  { name: 'Orders', icon: faShoppingCart, path: '/admin/orders' },
  { name: 'Users', icon: faUsers, path: '/admin/users' },
  { name: 'Services', icon: faList, path: '/admin/services' },
  { name: 'Categories', icon: faTags, path: '/admin/categories' },
  { name: 'Payments', icon: faMoneyBillWave, path: '/admin/payments' },
  { name: 'Providers', icon: faPlug, path: '/admin/providers' },
  { name: 'Tickets', icon: faTicketAlt, path: '/admin/tickets' },
  { name: 'Reports', icon: faChartBar, path: '/admin/reports' },
  { name: 'Announcements', icon: faBullhorn, path: '/admin/announcements' },
  { name: 'Settings', icon: faCog, path: '/admin/settings' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };

  return (
    <div className={`w-64 bg-brand-dark text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-[60] transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
            <FontAwesomeIcon icon={faRocket} className="text-white text-lg" />
          </div>
          <span className="text-xl font-display font-black tracking-tighter">EasyAdmin</span>
        </div>
        <button 
          className="lg:hidden text-white/40 hover:text-white"
          onClick={() => setIsOpen(false)}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="rotate-180" />
        </button>
      </div>

      <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${
                isActive 
                ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FontAwesomeIcon 
                icon={item.icon} 
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white'}`} 
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all group"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
