import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faShoppingCart, 
  faMoneyBillWave, 
  faClock, 
  faCheckCircle, 
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const stats = [
  { title: 'Total Users', value: '12,482', icon: faUsers, color: 'text-blue-500', bg: 'bg-blue-50', trend: '+12%', isUp: true },
  { title: 'Total Orders', value: '84,921', icon: faShoppingCart, color: 'text-brand-orange', bg: 'bg-brand-orange/10', trend: '+18%', isUp: true },
  { title: 'Total Revenue', value: 'UGX 42.8M', icon: faMoneyBillWave, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+24%', isUp: true },
  { title: 'Pending Orders', value: '142', icon: faClock, color: 'text-amber-500', bg: 'bg-amber-50', trend: '-5%', isUp: false },
];

const chartData = [
  { name: 'Mon', orders: 400, revenue: 2400, users: 200 },
  { name: 'Tue', orders: 300, revenue: 1398, users: 210 },
  { name: 'Wed', orders: 200, revenue: 9800, users: 220 },
  { name: 'Thu', orders: 278, revenue: 3908, users: 230 },
  { name: 'Fri', orders: 189, revenue: 4800, users: 240 },
  { name: 'Sat', orders: 239, revenue: 3800, users: 250 },
  { name: 'Sun', orders: 349, revenue: 4300, users: 260 },
];

const recentOrders = [
  { id: '#ORD-9021', user: 'john_doe', service: 'Instagram Followers', status: 'Processing', amount: 'UGX 2,400', date: '2 mins ago' },
  { id: '#ORD-9020', user: 'sarah_smith', service: 'TikTok Likes', status: 'Completed', amount: 'UGX 800', date: '15 mins ago' },
  { id: '#ORD-9019', user: 'mike_ross', service: 'YouTube Views', status: 'Pending', amount: 'UGX 12,000', date: '1 hour ago' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-brand-dark tracking-tighter mb-1 md:mb-2">Dashboard</h1>
          <p className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest">Overview of your SMM platform</p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden sm:block px-4 md:px-6 py-2 md:py-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">
            Last updated: <span className="text-brand-dark">Just now</span>
          </div>
          <button className="flex-grow md:flex-grow-0 px-6 md:px-8 py-3 md:py-3.5 gradient-brand text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all active:scale-95">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-brand-orange/5 transition-all group"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className={`w-12 h-12 md:w-14 md:h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-xl md:text-2xl transition-transform group-hover:scale-110 shadow-sm`}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div className={`flex items-center space-x-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                <FontAwesomeIcon icon={stat.isUp ? faArrowUp : faArrowDown} />
                <span>{stat.trend}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-display font-black text-brand-dark">{stat.value}</div>
              <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.title}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-display font-black text-brand-dark tracking-tighter mb-8">Revenue & Orders</h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#F27D26" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-display font-black text-brand-dark tracking-tighter mb-8">User Growth</h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                />
                <Bar dataKey="users" fill="#10b981" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <h2 className="text-xl md:text-2xl font-display font-black text-brand-dark tracking-tighter">Recent Orders</h2>
            <button className="text-[10px] md:text-xs font-black text-brand-orange uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto -mx-6 md:mx-0">
            <div className="inline-block min-w-full align-middle px-6 md:px-0">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                    <th className="pb-4 md:pb-6 px-2 md:px-4">ID</th>
                    <th className="pb-4 md:pb-6 px-2 md:px-4">User</th>
                    <th className="pb-4 md:pb-6 px-2 md:px-4">Service</th>
                    <th className="pb-4 md:pb-6 px-2 md:px-4">Amount</th>
                    <th className="pb-4 md:pb-6 px-2 md:px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order, idx) => (
                    <tr key={idx} className="group hover:bg-brand-light/30 transition-colors">
                      <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-black text-brand-dark">{order.id}</td>
                      <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-bold text-gray-500">{order.user}</td>
                      <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-bold text-gray-700 truncate max-w-[100px] md:max-w-none">{order.service}</td>
                      <td className="py-4 md:py-6 px-2 md:px-4 text-xs md:text-sm font-black text-brand-dark">{order.amount}</td>
                      <td className="py-4 md:py-6 px-2 md:px-4">
                        <span className={`inline-flex items-center px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
                          order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="lg:col-span-4 space-y-6 md:space-y-10">
          <div className="bg-brand-dark p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl shadow-brand-dark/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
            <h3 className="text-lg md:text-xl font-display font-black tracking-tighter mb-6 md:mb-8">System Health</h3>
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">
                  <span>API Success</span>
                  <span>99.8%</span>
                </div>
                <div className="h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[99.8%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">
                  <span>Server Load</span>
                  <span>24%</span>
                </div>
                <div className="h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange w-[24%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-base md:text-lg font-display font-black text-brand-dark tracking-tighter mb-4 md:mb-6">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {['Add User', 'Add Service', 'Sync API', 'Settings'].map((link) => (
                <button key={link} className="p-3 md:p-4 rounded-2xl bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange transition-all text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
