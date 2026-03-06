import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faHistory, faCheckCircle, faClock, faTimesCircle, faSpinner, faRocket } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

const statusStyles: Record<string, any> = {
  'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: faCheckCircle },
  'Processing': { bg: 'bg-brand-blue/5', text: 'text-brand-blue', icon: faSpinner },
  'In progress': { bg: 'bg-brand-blue/5', text: 'text-brand-blue', icon: faSpinner },
  'Pending': { bg: 'bg-amber-50', text: 'text-amber-600', icon: faClock },
  'Canceled': { bg: 'bg-rose-50', text: 'text-rose-600', icon: faTimesCircle },
  'Cancelled': { bg: 'bg-rose-50', text: 'text-rose-600', icon: faTimesCircle },
  'Partial': { bg: 'bg-brand-purple/5', text: 'text-brand-purple', icon: faSpinner },
  'Failed': { bg: 'bg-rose-50', text: 'text-rose-600', icon: faTimesCircle },
};

const OrderSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm shimmer space-y-4 h-32">
    <div className="flex justify-between">
      <div className="space-y-2 w-1/2">
        <div className="h-2 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </div>
    <div className="flex justify-between pt-4 border-t border-gray-50">
      <div className="h-3 bg-gray-200 rounded w-16"></div>
      <div className="h-3 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);

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

  if (isLoading) {
    return (
      <div className="pt-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="h-12 bg-gray-100 rounded-2xl w-full max-w-md shimmer"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <OrderSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3 w-full md:max-w-md">
          <div className="relative group flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
              <FontAwesomeIcon icon={faSearch} className="text-xs" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/5 focus:border-brand-purple transition-all w-full font-bold text-gray-900 shadow-sm text-xs"
            />
          </div>
          <button className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-400 hover:text-brand-purple hover:border-brand-purple transition-all shadow-sm group">
            <FontAwesomeIcon icon={faFilter} className="group-hover:scale-110 transition-transform text-xs" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2.5 rounded-full border border-gray-200 shadow-sm self-start md:self-auto">
          <FontAwesomeIcon icon={faHistory} className="text-brand-purple" />
          <span>Showing {filteredOrders.length} Orders</span>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Service</th>
                  <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Link</th>
                  <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                  <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5 text-[10px] font-black text-gray-900 group-hover:text-brand-purple transition-colors truncate max-w-[100px]">#{order.id.slice(-6)}</td>
                    <td className="px-8 py-5 text-[10px] font-bold text-gray-500 max-w-[200px] truncate">{order.service}</td>
                    <td className="px-8 py-5 text-[10px] text-brand-purple font-black truncate max-w-[150px] hover:underline transition-all underline-offset-4">{order.link}</td>
                    <td className="px-8 py-5 text-[10px] font-black text-gray-900 text-center">{order.quantity}</td>
                    <td className="px-8 py-5 text-[10px] font-black text-gray-900">UGX {order.price?.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${statusStyles[order.status as keyof typeof statusStyles]?.bg || 'bg-gray-50'} ${statusStyles[order.status as keyof typeof statusStyles]?.text || 'text-gray-400'} shadow-sm border border-white/50`}>
                        <FontAwesomeIcon icon={statusStyles[order.status as keyof typeof statusStyles]?.icon || faClock} className={`mr-1.5 ${order.status === 'Processing' ? 'animate-spin' : ''}`} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Compact List */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">#{order.id.slice(-6)}</span>
                    <span className="text-xs font-black text-gray-900 tracking-tight truncate max-w-[180px]">{order.service}</span>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${statusStyles[order.status as keyof typeof statusStyles]?.bg || 'bg-white'} ${statusStyles[order.status as keyof typeof statusStyles]?.text || 'text-gray-400'} border border-gray-100`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Quantity</span>
                    <span className="text-[10px] font-black text-gray-900">{order.quantity}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Price</span>
                    <span className="text-[10px] font-black text-brand-purple">UGX {order.price?.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-gray-50 rounded-3xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-200 text-2xl border border-gray-100">
            <FontAwesomeIcon icon={faHistory} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter">No orders found</h3>
            <p className="text-gray-400 max-w-xs mx-auto font-medium text-xs">Your order history will appear here once you start boosting your social media.</p>
          </div>
          <Link to="/services" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-xl shadow-sm hover:scale-105 transition-all flex items-center space-x-3 text-[10px]">
            <FontAwesomeIcon icon={faRocket} className="text-[10px]" />
            <span>Boost Now</span>
          </Link>
        </div>
      )}
    </div>
  );
}
