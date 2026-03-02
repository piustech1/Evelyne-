import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faEllipsisV, 
  faEye, 
  faEdit, 
  faTimesCircle, 
  faSyncAlt, 
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

const orders = [
  { id: '#ORD-9021', user: 'john_doe', service: 'Instagram Followers', link: 'instagram.com/user1', quantity: '1,000', charge: 'UGX 2,400', status: 'Processing', payment: 'MTN MoMo', date: '2026-03-02 05:40' },
  { id: '#ORD-9020', user: 'sarah_smith', service: 'TikTok Likes', link: 'tiktok.com/@user2', quantity: '500', charge: 'UGX 800', status: 'Completed', payment: 'Airtel Money', date: '2026-03-02 05:25' },
  { id: '#ORD-9019', user: 'mike_ross', service: 'YouTube Views', link: 'youtube.com/watch?v=123', quantity: '5,000', charge: 'UGX 12,000', status: 'Pending', payment: 'MTN MoMo', date: '2026-03-02 04:40' },
  { id: '#ORD-9018', user: 'jane_doe', service: 'Facebook Likes', link: 'facebook.com/page1', quantity: '2,000', charge: 'UGX 1,600', status: 'Cancelled', payment: 'Wallet', date: '2026-03-02 03:15' },
  { id: '#ORD-9017', user: 'alex_king', service: 'Instagram Likes', link: 'instagram.com/p/abc', quantity: '1,500', charge: 'UGX 750', status: 'Partial', payment: 'MTN MoMo', date: '2026-03-02 02:40' },
];

const statusStyles = {
  'Completed': 'bg-emerald-100 text-emerald-600',
  'Processing': 'bg-blue-100 text-blue-600',
  'Pending': 'bg-amber-100 text-amber-600',
  'Cancelled': 'bg-rose-100 text-rose-600',
  'Partial': 'bg-purple-100 text-purple-600',
};

export default function AdminOrders() {
  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-brand-dark tracking-tighter mb-1 md:mb-2">Orders</h1>
          <p className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center space-x-2 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest bg-white px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-gray-100 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Live Updates Active</span>
          </div>
        </div>
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
                placeholder="Search orders..."
                className="pl-12 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all w-full font-bold text-sm"
              />
            </div>
            <button className="p-3.5 md:p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-brand-orange hover:border-brand-orange transition-all group">
              <FontAwesomeIcon icon={faFilter} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0">
            {['All', 'Pending', 'Processing', 'Completed', 'Cancelled'].map((status) => (
              <button
                key={status}
                className={`px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  status === 'All' 
                  ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 md:mx-0">
          <div className="inline-block min-w-full align-middle px-6 md:px-0">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                  <th className="pb-4 md:pb-6 px-2 md:px-4">ID</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4">User</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4">Service</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4 hidden lg:table-cell">Link</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4 text-center">Qty</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4">Charge</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4">Status</th>
                  <th className="pb-4 md:pb-6 px-2 md:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-brand-light/30 transition-colors"
                  >
                    <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-black text-brand-dark group-hover:text-brand-orange transition-colors">{order.id}</td>
                    <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-bold text-gray-500">{order.user}</td>
                    <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-bold text-gray-700 truncate max-w-[100px] md:max-w-none">{order.service}</td>
                    <td className="py-4 md:py-6 px-2 md:px-4 text-xs text-brand-orange font-bold truncate max-w-[100px] hover:underline transition-all underline-offset-4 cursor-pointer hidden lg:table-cell">{order.link}</td>
                    <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-black text-brand-dark text-center">{order.quantity}</td>
                    <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-black text-brand-dark">{order.charge}</td>
                    <td className="py-4 md:py-6 px-2 md:px-4">
                      <span className={`inline-flex items-center px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${statusStyles[order.status as keyof typeof statusStyles]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 md:py-6 px-2 md:px-4 text-right">
                      <div className="flex items-center justify-end space-x-1 md:space-x-2">
                        <button className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all flex items-center justify-center group/btn">
                          <FontAwesomeIcon icon={faEye} className="text-xs md:text-sm group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center group/btn">
                          <FontAwesomeIcon icon={faEdit} className="text-xs md:text-sm group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 md:pt-10 border-t border-gray-50">
          <div className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">
            Showing <span className="text-brand-dark">1-5</span> of <span className="text-brand-dark">84,921</span>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2">
            <button className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-gray-100 transition-all">Prev</button>
            <button className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-brand-orange text-white font-black text-[9px] md:text-[10px] shadow-lg shadow-brand-orange/20">1</button>
            <button className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 text-gray-400 font-black text-[9px] md:text-[10px] hover:bg-gray-100">2</button>
            <button className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-gray-100 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
