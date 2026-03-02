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
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-dark tracking-tighter mb-2">Users</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Manage your customer base and their accounts</p>
        </div>
        <button className="px-8 py-4 gradient-brand text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all active:scale-95 flex items-center space-x-3">
          <FontAwesomeIcon icon={faUserPlus} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center space-x-4 w-full md:max-w-xl">
            <div className="relative group flex-grow">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-orange transition-colors">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <input
                type="text"
                placeholder="Search by username, email, or ID..."
                className="pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all w-full font-bold text-sm"
              />
            </div>
            <button className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-brand-orange hover:border-brand-orange transition-all group">
              <FontAwesomeIcon icon={faFilter} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Total Active: <span className="text-emerald-500">12,478</span>
            </div>
            <div className="w-px h-4 bg-gray-100" />
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Total Banned: <span className="text-rose-500">4</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="pb-6 px-4">User ID</th>
                <th className="pb-6 px-4">Username</th>
                <th className="pb-6 px-4">Email</th>
                <th className="pb-6 px-4">Balance</th>
                <th className="pb-6 px-4 text-center">Orders</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4">Join Date</th>
                <th className="pb-6 px-4 text-right">Actions</th>
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
                  <td className="py-6 px-4 text-sm font-black text-brand-dark group-hover:text-brand-orange transition-colors">{user.id}</td>
                  <td className="py-6 px-4 text-sm font-black text-brand-dark">{user.username}</td>
                  <td className="py-6 px-4 text-sm font-bold text-gray-500">{user.email}</td>
                  <td className="py-6 px-4 text-sm font-black text-emerald-500">{user.balance}</td>
                  <td className="py-6 px-4 text-sm font-black text-brand-dark text-center">{user.orders}</td>
                  <td className="py-6 px-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      user.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-400">{user.date}</td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all flex items-center justify-center group/btn">
                        <FontAwesomeIcon icon={faEye} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center group/btn">
                        <FontAwesomeIcon icon={faWallet} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center group/btn">
                        <FontAwesomeIcon icon={faBan} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center group/btn">
                        <FontAwesomeIcon icon={faTrashAlt} className="group-hover/btn:scale-110 transition-transform" />
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
  );
}
