import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faHistory, faCheckCircle, faClock, faTimesCircle, faSpinner, faRocket } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

const statusStyles: Record<string, any> = {
  'Completed': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: faCheckCircle },
  'Processing': { bg: 'bg-brand-blue/10', text: 'text-brand-blue', icon: faSpinner },
  'In progress': { bg: 'bg-brand-blue/10', text: 'text-brand-blue', icon: faSpinner },
  'Pending': { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: faClock },
  'Canceled': { bg: 'bg-rose-500/10', text: 'text-rose-500', icon: faTimesCircle },
  'Cancelled': { bg: 'bg-rose-500/10', text: 'text-rose-500', icon: faTimesCircle },
  'Partial': { bg: 'bg-brand-purple/10', text: 'text-brand-purple', icon: faSpinner },
  'Failed': { bg: 'bg-rose-500/10', text: 'text-rose-500', icon: faTimesCircle },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      const ordersRef = ref(db, 'orders');
      const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(user.uid));
      
      onValue(userOrdersQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const ordersArray = Object.entries(data).map(([id, value]: [string, any]) => ({
            id,
            ...value,
          })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(ordersArray);
        } else {
          setOrders([]);
        }
        setIsLoading(false);
      });
    }
  }, [user]);

  const filteredOrders = orders.filter(order => 
    order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="pt-32 text-center text-white font-black uppercase tracking-widest">Loading Orders...</div>;

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center space-x-4 w-full md:max-w-xl">
          <div className="relative group flex-grow">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-purple transition-colors">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-5 bg-brand-card border border-white/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all w-full font-bold text-white shadow-xl"
            />
          </div>
          <button className="p-5 bg-brand-card border border-white/10 rounded-3xl text-gray-500 hover:text-brand-purple hover:border-brand-purple transition-all shadow-xl group">
            <FontAwesomeIcon icon={faFilter} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-brand-card px-6 py-4 rounded-full border border-white/5 shadow-xl self-start md:self-auto">
          <FontAwesomeIcon icon={faHistory} className="text-brand-purple" />
          <span>Showing {filteredOrders.length} Orders</span>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-brand-card rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Order ID</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Service</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Link</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Quantity</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Price</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-10 py-8 text-xs font-black text-white group-hover:text-brand-purple transition-colors truncate max-w-[120px]">#{order.id.slice(-6)}</td>
                    <td className="px-10 py-8 text-xs font-bold text-gray-400">{order.service}</td>
                    <td className="px-10 py-8 text-xs text-brand-purple font-black truncate max-w-[180px] hover:underline transition-all underline-offset-4">{order.link}</td>
                    <td className="px-10 py-8 text-xs font-black text-white text-center">{order.quantity}</td>
                    <td className="px-10 py-8 text-xs font-black text-white">UGX {order.price?.toLocaleString()}</td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${statusStyles[order.status as keyof typeof statusStyles]?.bg || 'bg-gray-500/10'} ${statusStyles[order.status as keyof typeof statusStyles]?.text || 'text-gray-500'} shadow-sm`}>
                        <FontAwesomeIcon icon={statusStyles[order.status as keyof typeof statusStyles]?.icon || faClock} className={`mr-2 ${order.status === 'Processing' ? 'animate-spin' : ''}`} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-xs text-gray-500 font-bold uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Compact List */}
          <div className="lg:hidden space-y-4">
            {filteredOrders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-brand-card p-6 rounded-[2.5rem] shadow-xl border border-white/5 flex flex-col space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">#{order.id.slice(-6)}</span>
                    <span className="text-sm font-black text-white tracking-tight">{order.service}</span>
                  </div>
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${statusStyles[order.status as keyof typeof statusStyles]?.bg || 'bg-gray-500/10'} ${statusStyles[order.status as keyof typeof statusStyles]?.text || 'text-gray-500'}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Quantity</span>
                    <span className="text-xs font-black text-white">{order.quantity}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Price</span>
                    <span className="text-xs font-black text-brand-purple">UGX {order.price?.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-brand-card rounded-[3.5rem] border border-white/5 shadow-2xl">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-700 text-4xl shadow-inner">
            <FontAwesomeIcon icon={faHistory} />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-display font-black text-white tracking-tighter">No orders found</h3>
            <p className="text-gray-500 max-w-xs mx-auto font-medium text-sm">Your order history will appear here once you start boosting your social media.</p>
          </div>
          <Link to="/services" className="px-10 py-5 gradient-brand text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-brand-blue/30 hover:scale-105 transition-all flex items-center space-x-3">
            <FontAwesomeIcon icon={faRocket} className="text-xs" />
            <span>Boost Now</span>
          </Link>
        </div>
      )}
    </div>
  );
}
