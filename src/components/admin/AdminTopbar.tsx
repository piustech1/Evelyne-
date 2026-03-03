import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faUserCircle, faBars } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { userData } = useAuth();

  return (
    <header className="h-20 bg-brand-dark/80 border-b border-white/5 flex items-center justify-between px-6 md:px-12 fixed top-0 right-0 left-0 lg:left-64 z-40 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center flex-grow max-w-xl">
        <button 
          onClick={onMenuClick}
          className="lg:hidden w-12 h-12 flex items-center justify-center text-gray-500 hover:text-brand-purple mr-4 bg-white/5 rounded-2xl transition-all"
        >
          <FontAwesomeIcon icon={faBars} className="text-xl" />
        </button>
        
        <div className="relative group flex-grow hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-600 group-focus-within:text-brand-purple transition-colors">
            <FontAwesomeIcon icon={faSearch} />
          </div>
          <input
            type="text"
            placeholder="Search everything..."
            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-8">
        <button className="relative w-12 h-12 rounded-2xl bg-white/5 text-gray-500 hover:text-brand-purple hover:bg-brand-purple/10 transition-all group border border-white/5">
          <FontAwesomeIcon icon={faBell} className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 border-2 border-brand-dark rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
        </button>

        <div className="flex items-center space-x-4 pl-4 md:pl-8 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{userData?.name || 'Admin'}</div>
            <div className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-1">Super Admin</div>
          </div>
          <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple text-xl shadow-inner border border-brand-purple/10">
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
        </div>
      </div>
    </header>
  );
}
