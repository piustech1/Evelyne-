import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faHistory, faCheckCircle, faClock, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const orders: any[] = [];

const statusStyles = {
  'Completed': { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: faCheckCircle },
  'Processing': { bg: 'bg-blue-100', text: 'text-blue-600', icon: faSpinner },
  'Pending': { bg: 'bg-amber-100', text: 'text-amber-600', icon: faClock },
  'Failed': { bg: 'bg-rose-100', text: 'text-rose-600', icon: faTimesCircle },
};

export default function Orders() {
  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center space-x-4 w-full md:max-w-xl">
          <div className="relative group flex-grow">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-orange transition-colors">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <input
              type="text"
              placeholder="Search by order ID or service..."
              className="pl-12 pr-4 py-5 bg-white border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all w-full font-medium shadow-sm"
            />
          </div>
          <button className="p-5 bg-white border border-gray-200 rounded-3xl text-gray-500 hover:text-brand-orange hover:border-brand-orange transition-all shadow-sm group">
            <FontAwesomeIcon icon={faFilter} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 text-sm font-bold text-gray-400 uppercase tracking-widest bg-white px-6 py-3 rounded-full border border-gray-100 shadow-sm self-start md:self-auto">
          <FontAwesomeIcon icon={faHistory} className="text-brand-orange" />
          <span>Showing {orders.length} Orders</span>
        </div>
      </div>

      {orders.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-light/50 border-b border-gray-100">
                  <th className="px-10 py-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-10 py-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Service</th>
                  <th className="px-10 py-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Link</th>
                  <th className="px-10 py-8 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Quantity</th>
                  <th className="px-10 py-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="px-10 py-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-brand-light/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-10 py-8 text-sm font-bold text-brand-dark group-hover:text-brand-orange transition-colors">{order.id}</td>
                    <td className="px-10 py-8 text-sm font-bold text-gray-700">{order.service}</td>
                    <td className="px-10 py-8 text-sm text-brand-orange font-bold truncate max-w-[180px] hover:underline transition-all underline-offset-4">{order.link}</td>
                    <td className="px-10 py-8 text-sm font-bold text-brand-dark text-center">{order.quantity}</td>
                    <td className="px-10 py-8 text-sm font-bold text-brand-dark">{order.price}</td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusStyles[order.status as keyof typeof statusStyles].bg} ${statusStyles[order.status as keyof typeof statusStyles].text} shadow-sm`}>
                        <FontAwesomeIcon icon={statusStyles[order.status as keyof typeof statusStyles].icon} className={`mr-2 ${order.status === 'Processing' ? 'animate-spin' : ''}`} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-sm text-gray-400 font-bold uppercase tracking-wider">{order.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Compact List */}
          <div className="lg:hidden space-y-3">
            {orders.map((order, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.id}</span>
                    <span className="text-sm font-bold text-brand-dark">{order.service}</span>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${statusStyles[order.status as keyof typeof statusStyles].bg} ${statusStyles[order.status as keyof typeof statusStyles].text}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Quantity</span>
                    <span className="text-xs font-bold text-brand-dark">{order.quantity}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Date</span>
                    <span className="text-xs text-gray-500 font-medium">{order.date.split(' ')[0]}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 text-4xl">
            <FontAwesomeIcon icon={faHistory} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-brand-dark tracking-tight">No orders yet</h3>
            <p className="text-gray-400 max-w-xs mx-auto">Your order history will appear here once you start boosting your social media.</p>
          </div>
          <Link to="/services" className="px-8 py-4 gradient-brand text-white font-bold rounded-2xl shadow-lg shadow-brand-orange/20 hover:scale-105 transition-all">
            Boost Now
          </Link>
        </div>
      )}
    </div>
  );
}
