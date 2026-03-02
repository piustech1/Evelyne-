import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faShoppingCart, 
  faMoneyBillWave, 
  faClock, 
  faCheckCircle, 
  faChartLine,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

const stats = [
  { title: 'Total Users', value: '12,482', icon: faUsers, color: 'text-blue-500', bg: 'bg-blue-50', trend: '+12%', isUp: true },
  { title: 'Total Orders', value: '84,921', icon: faShoppingCart, color: 'text-brand-orange', bg: 'bg-brand-orange/10', trend: '+18%', isUp: true },
  { title: 'Total Revenue', value: 'UGX 42.8M', icon: faMoneyBillWave, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+24%', isUp: true },
  { title: 'Pending Orders', value: '142', icon: faClock, color: 'text-amber-500', bg: 'bg-amber-50', trend: '-5%', isUp: false },
];

const secondaryStats = [
  { title: 'Completed Orders', value: '82,104', icon: faCheckCircle, color: 'text-emerald-500' },
  { title: 'Today Orders', value: '1,248', icon: faShoppingCart, color: 'text-brand-orange' },
  { title: 'Today Revenue', value: 'UGX 1.2M', icon: faMoneyBillWave, color: 'text-emerald-500' },
];

const recentOrders = [
  { id: '#ORD-9021', user: 'john_doe', service: 'Instagram Followers', status: 'Processing', amount: 'UGX 2,400', date: '2 mins ago' },
  { id: '#ORD-9020', user: 'sarah_smith', service: 'TikTok Likes', status: 'Completed', amount: 'UGX 800', date: '15 mins ago' },
  { id: '#ORD-9019', user: 'mike_ross', service: 'YouTube Views', status: 'Pending', amount: 'UGX 12,000', date: '1 hour ago' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-dark tracking-tighter mb-2">Dashboard</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Overview of your SMM platform</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-xs font-black text-gray-400 uppercase tracking-widest">
            Last updated: <span className="text-brand-dark">Just now</span>
          </div>
          <button className="px-8 py-3.5 gradient-brand text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all active:scale-95">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-brand-orange/5 transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 shadow-sm`}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div className={`flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                <FontAwesomeIcon icon={stat.isUp ? faArrowUp : faArrowDown} />
                <span>{stat.trend}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-display font-black text-brand-dark">{stat.value}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.title}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {secondaryStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center space-x-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${stat.color} bg-gray-50`}>
              <FontAwesomeIcon icon={stat.icon} />
            </div>
            <div>
              <div className="text-lg font-black text-brand-dark">{stat.value}</div>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-display font-black text-brand-dark tracking-tighter">Recent Orders</h2>
            <button className="text-xs font-black text-brand-orange uppercase tracking-widest hover:underline">View All Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                  <th className="pb-6 px-4">Order ID</th>
                  <th className="pb-6 px-4">User</th>
                  <th className="pb-6 px-4">Service</th>
                  <th className="pb-6 px-4">Amount</th>
                  <th className="pb-6 px-4">Status</th>
                  <th className="pb-6 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="group hover:bg-brand-light/30 transition-colors">
                    <td className="py-6 px-4 text-sm font-black text-brand-dark">{order.id}</td>
                    <td className="py-6 px-4 text-sm font-bold text-gray-500">{order.user}</td>
                    <td className="py-6 px-4 text-sm font-bold text-gray-700">{order.service}</td>
                    <td className="py-6 px-4 text-sm font-black text-brand-dark">{order.amount}</td>
                    <td className="py-6 px-4">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-xs font-bold text-gray-400">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-brand-dark p-10 rounded-[3rem] text-white shadow-2xl shadow-brand-dark/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
            <h3 className="text-xl font-display font-black tracking-tighter mb-8">System Health</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                  <span>API Success Rate</span>
                  <span>99.8%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[99.8%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                  <span>Server Load</span>
                  <span>24%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange w-[24%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-display font-black text-brand-dark tracking-tighter mb-6">Quick Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-2xl bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange transition-all text-xs font-black uppercase tracking-widest text-gray-400">
                Add User
              </button>
              <button className="p-4 rounded-2xl bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange transition-all text-xs font-black uppercase tracking-widest text-gray-400">
                Add Service
              </button>
              <button className="p-4 rounded-2xl bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange transition-all text-xs font-black uppercase tracking-widest text-gray-400">
                Sync API
              </button>
              <button className="p-4 rounded-2xl bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange transition-all text-xs font-black uppercase tracking-widest text-gray-400">
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
