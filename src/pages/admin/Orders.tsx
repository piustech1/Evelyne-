import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faEye, 
  faEdit, 
  faCheckCircle,
  faClock,
  faTimesCircle,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, update } from 'firebase/database';

const statusStyles: any = {
  'Completed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Processing': 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
  'Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Cancelled': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  'Partial': 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(ordersArray);
        setFilteredOrders(ordersArray);
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'All') {
      result = result.filter(order => order.status === statusFilter);
    }
    if (searchTerm) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.service?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await update(ref(db, `orders/${orderId}`), { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter mb-2">Orders</h1>
          <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center space-x-3 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 shadow-xl">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span>Live Updates Active</span>
          </div>
        </div>
      </div>

      <div className="bg-brand-card p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div className="flex items-center space-x-4 w-full md:max-w-xl">
            <div className="relative group flex-grow">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-600 group-focus-within:text-brand-purple transition-colors">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white/10 transition-all w-full font-bold text-sm"
              />
            </div>
            <button className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-brand-purple hover:border-brand-purple transition-all group flex items-center justify-center">
              <FontAwesomeIcon icon={faFilter} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-4 md:pb-0 -mx-8 px-8 md:mx-0 md:px-0 scrollbar-hide">
            {['All', 'Pending', 'Processing', 'Completed', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  statusFilter === status 
                  ? 'bg-brand-purple text-white border-brand-purple shadow-2xl shadow-brand-purple/20' 
                  : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="pb-6 px-4">ID</th>
                <th className="pb-6 px-4">User</th>
                <th className="pb-6 px-4">Service</th>
                <th className="pb-6 px-4 hidden lg:table-cell">Link</th>
                <th className="pb-6 px-4 text-center">Qty</th>
                <th className="pb-6 px-4">Charge</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order, idx) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-white/5 transition-colors"
                >
                  <td className="py-6 px-4 text-xs font-black text-white group-hover:text-brand-purple transition-colors">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-500">{order.userEmail}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-400 truncate max-w-[150px]">{order.service}</td>
                  <td className="py-6 px-4 text-xs text-brand-blue font-bold truncate max-w-[150px] hover:underline transition-all underline-offset-4 cursor-pointer hidden lg:table-cell">{order.link}</td>
                  <td className="py-6 px-4 text-xs font-black text-white text-center">{order.quantity?.toLocaleString()}</td>
                  <td className="py-6 px-4 text-xs font-black text-white">UGX {order.price?.toLocaleString()}</td>
                  <td className="py-6 px-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyles[order.status] || statusStyles['Pending']}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'Completed')}
                        className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center border border-emerald-500/20"
                        title="Mark as Completed"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                        className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-rose-500/20"
                        title="Cancel Order"
                      >
                        <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && !isLoading && (
            <div className="py-20 text-center">
              <div className="text-gray-600 font-black uppercase tracking-widest text-xs">No orders found matching your criteria</div>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-white/5">
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            Showing <span className="text-white">{filteredOrders.length}</span> of <span className="text-white">{orders.length}</span> total orders
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-6 py-3.5 rounded-2xl bg-white/5 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/5">Prev</button>
            <button className="w-12 h-12 rounded-2xl bg-brand-purple text-white font-black text-[10px] shadow-2xl shadow-brand-purple/20">1</button>
            <button className="px-6 py-3.5 rounded-2xl bg-white/5 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/5">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
