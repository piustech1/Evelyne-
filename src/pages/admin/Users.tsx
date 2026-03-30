import { useState, useEffect } from 'react';
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
  faEye,
  faShieldAlt,
  faUserSlash,
  faUsers,
  faCode
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, update, remove } from 'firebase/database';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })));
      } else {
        setUsers([]);
      }
      setIsLoading(false);
    });
  }, []);

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      await update(ref(db, `users/${userId}`), { isAdmin: !currentStatus });
    } catch (err) {
      console.error('Failed to toggle admin status', err);
    }
  };

  const toggleBan = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Banned' ? 'Active' : 'Banned';
    try {
      await update(ref(db, `users/${userId}`), { status: newStatus });
    } catch (err) {
      console.error('Failed to toggle ban status', err);
    }
  };

  const toggleApi = async (userId: string, currentStatus: boolean) => {
    try {
      await update(ref(db, `users/${userId}`), { apiDisabled: !currentStatus });
    } catch (err) {
      console.error('Failed to toggle API status', err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tighter mb-2">Users</h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Manage your customer base</p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div className="flex items-center space-x-4 w-full md:max-w-xl">
            <div className="relative group flex-grow">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all w-full font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="pb-6 px-4">User ID</th>
                <th className="pb-6 px-4">Name</th>
                <th className="pb-6 px-4 hidden sm:table-cell">Email</th>
                <th className="pb-6 px-4">Balance</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="py-6 px-4 text-xs font-black text-gray-900 group-hover:text-brand-purple transition-colors">#{user.id.slice(-6).toUpperCase()}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-500 flex items-center gap-2">
                    {user.name}
                    {user.isAdmin && (
                      <span className="text-[8px] bg-brand-purple/20 text-brand-purple px-2 py-0.5 rounded-full font-black uppercase">Admin</span>
                    )}
                  </td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-400 hidden sm:table-cell">{user.email}</td>
                  <td className="py-6 px-4 text-xs font-black text-emerald-500">UGX {user.balance?.toLocaleString() || 0}</td>
                  <td className="py-6 px-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      user.status === 'Banned' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => toggleAdmin(user.id, user.isAdmin)}
                        className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border ${
                          user.isAdmin ? 'bg-brand-purple text-white border-brand-purple' : 'bg-gray-100 text-gray-400 border-gray-100 hover:text-brand-purple hover:bg-brand-purple/10'
                        }`}
                        title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      >
                        <FontAwesomeIcon icon={faShieldAlt} className="text-xs" />
                      </button>
                      <button 
                        onClick={() => toggleBan(user.id, user.status)}
                        className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border ${
                          user.status === 'Banned' ? 'bg-rose-500 text-white border-rose-500' : 'bg-gray-100 text-gray-400 border-gray-100 hover:text-rose-500 hover:bg-rose-500/10'
                        }`}
                        title={user.status === 'Banned' ? 'Unban User' : 'Ban User'}
                      >
                        <FontAwesomeIcon icon={faUserSlash} className="text-xs" />
                      </button>
                      <button 
                        onClick={() => toggleApi(user.id, !user.apiDisabled)}
                        className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border ${
                          !user.apiDisabled ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-gray-100 text-gray-400 border-gray-100 hover:text-emerald-500 hover:bg-emerald-500/10'
                        }`}
                        title={user.apiDisabled ? 'Enable API' : 'Disable API'}
                      >
                        <FontAwesomeIcon icon={faCode} className="text-xs" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && !isLoading && (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-3xl mx-auto">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="text-gray-400 font-black uppercase tracking-widest text-xs">No users found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
