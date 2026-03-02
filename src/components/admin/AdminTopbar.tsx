import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default function AdminTopbar() {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 fixed top-0 right-0 left-64 z-40 shadow-sm backdrop-blur-md bg-white/80">
      <div className="flex-grow max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-orange transition-colors">
            <FontAwesomeIcon icon={faSearch} />
          </div>
          <input
            type="text"
            placeholder="Search orders, users, services..."
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all font-bold text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all group">
          <FontAwesomeIcon icon={faBell} className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
        </button>

        <div className="flex items-center space-x-4 pl-6 border-l border-gray-100">
          <div className="text-right hidden md:block">
            <div className="text-sm font-black text-brand-dark uppercase tracking-widest">Admin User</div>
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Super Admin</div>
          </div>
          <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center text-brand-orange text-xl shadow-inner border border-brand-orange/10">
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
        </div>
      </div>
    </header>
  );
}
