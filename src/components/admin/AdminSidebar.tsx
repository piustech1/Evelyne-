import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  faRocket,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

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
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className={`w-64 bg-brand-dark text-white h-screen fixed left-0 top-0 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-[60] transition-transform duration-500 ease-in-out transform lg:translate-x-0 border-r border-white/5 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-blue/30">
            <FontAwesomeIcon icon={faRocket} className="text-white text-xl" />
          </div>
          <span className="text-2xl font-display font-black tracking-tighter">EasyAdmin</span>
        </div>
        <button 
          className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"
          onClick={() => setIsOpen(false)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <nav className="flex-grow px-6 space-y-2 overflow-y-auto custom-scrollbar pb-10">
        <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all group relative overflow-hidden ${
                isActive 
                ? 'bg-brand-purple text-white shadow-2xl shadow-brand-purple/20' 
                : 'text-gray-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FontAwesomeIcon 
                icon={item.icon} 
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-white'}`} 
              />
              <span>{item.name}</span>
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 px-5 py-5 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all group border border-rose-500/10"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
