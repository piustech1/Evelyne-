import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faUserPlus, 
  faBan, 
  faCheckCircle, 
  faWallet, 
  faHistory, 
  faTrashAlt, 
  faEye 
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

const users = [
  { id: '#USR-1021', username: 'john_doe', email: 'john@example.com', balance: 'UGX 124,500', orders: '1,284', status: 'Active', date: '2026-01-15' },
  { id: '#USR-1020', username: 'sarah_smith', email: 'sarah@example.com', balance: 'UGX 45,000', orders: '452', status: 'Active', date: '2026-01-20' },
  { id: '#USR-1019', username: 'mike_ross', email: 'mike@example.com', balance: 'UGX 0', orders: '12', status: 'Banned', date: '2026-02-05' },
  { id: '#USR-1018', username: 'jane_doe', email: 'jane@example.com', balance: 'UGX 2,400', orders: '84', status: 'Active', date: '2026-02-10' },
  { id: '#USR-1017', username: 'alex_king', email: 'alex@example.com', balance: 'UGX 1.2M', orders: '8,421', status: 'Active', date: '2026-02-15' },
];

export default function AdminUsers() {
  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-brand-dark tracking-tighter mb-1 md:mb-2">Users</h1>
          <p className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest">Manage your customer base</p>
        </div>
        <button className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 gradient-brand text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center space-x-3">
          <FontAwesomeIcon icon={faUserPlus} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-6">
          <div className="flex items-center space-x-4 w-full md:max-w-xl">
            <div className="relative group flex-grow">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-orange transition-colors">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-12 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all w-full font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 md:mx-0">
          <div className="inline-block min-w-full align-middle px-6 md:px-0">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                  <th className="pb-4 md:pb-6 px-2 md:px-4">User ID</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4">Username</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4 hidden sm:table-cell">Email</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4">Balance</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4">Status</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-brand-light/30 transition-colors"
                  >
                    <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-black text-brand-dark">{user.id}</td>
                    <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-bold text-gray-700">{user.username}</td>
                    <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-bold text-gray-400 hidden sm:table-cell">{user.email}</td>
                    <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-black text-emerald-500">{user.balance}</td>
                    <td className="py-4 md:py-6 px-2 md:px-4">
                      <span className={`inline-flex items-center px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
                        user.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 md:py-6 px-2 md:px-4 text-right">
                      <div className="flex items-center justify-end space-x-1 md:space-x-2">
                        <button className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all flex items-center justify-center">
                          <FontAwesomeIcon icon={faEye} className="text-xs md:text-sm" />
                        </button>
                        <button className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center">
                          <FontAwesomeIcon icon={faBan} className="text-xs md:text-sm" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
