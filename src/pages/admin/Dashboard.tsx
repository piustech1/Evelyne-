import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faShoppingCart, 
  faMoneyBillWave, 
  faClock, 
  faCheckCircle, 
  faArrowUp,
  faArrowDown,
  faSync,
  faChartPie,
  faWallet,
  faExchangeAlt
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { db } from '../../lib/firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '0', icon: faUsers, color: 'text-brand-blue', bg: 'bg-brand-blue/10', trend: '0%', isUp: true },
    { title: 'Total Orders', value: '0', icon: faShoppingCart, color: 'text-brand-purple', bg: 'bg-brand-purple/10', trend: '0%', isUp: true },
    { title: 'Total Revenue', value: 'UGX 0', icon: faMoneyBillWave, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '0%', isUp: true },
    { title: 'Total Profit', value: 'UGX 0', icon: faChartPie, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '0%', isUp: true },
  ]);

  const [secondaryStats, setSecondaryStats] = useState([
    { title: 'Successful Payments', value: '0', icon: faCheckCircle, color: 'text-emerald-500' },
    { title: 'Pending Payments', value: '0', icon: faClock, color: 'text-amber-500' },
    { title: 'API Cost', value: 'UGX 0', icon: faMoneyBillWave, color: 'text-rose-500' },
  ]);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [popularServices, setPopularServices] = useState<any[]>([]);
  const [providerBalance, setProviderBalance] = useState({ usd: 0, ugx: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProviderBalance = async () => {
    try {
      const response = await fetch('/api/smm/balance', { method: 'POST' });
      const data = await response.json();
      if (data.balance) {
        const usd = parseFloat(data.balance);
        setProviderBalance({
          usd,
          ugx: Math.round(usd * 3800)
        });
      }
    } catch (error) {
      console.error('Failed to fetch provider balance', error);
    }
  };

  useEffect(() => {
    fetchProviderBalance();
    const usersRef = ref(db, 'users');
    const ordersRef = ref(db, 'orders');
    const paymentsRef = ref(db, 'payments');

    onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      const userCount = users ? Object.keys(users).length : 0;
      setStats(prev => prev.map(s => s.title === 'Total Users' ? { ...s, value: userCount.toLocaleString() } : s));
    });

    onValue(paymentsRef, (snapshot) => {
      const payments = snapshot.val();
      if (payments) {
        const paymentsArray = Object.values(payments) as any[];
        const approvedPayments = paymentsArray.filter(p => p.status === 'Approved' || p.status === 'completed' || p.status === 'Successful');
        const pendingPayments = paymentsArray.filter(p => p.status === 'Pending' || p.status === 'pending');
        
        const totalRevenue = approvedPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
        setStats(prev => prev.map(s => s.title === 'Total Revenue' ? { ...s, value: `UGX ${totalRevenue.toLocaleString()}` } : s));
        setSecondaryStats(prev => prev.map(s => {
          if (s.title === 'Successful Payments') return { ...s, value: approvedPayments.length.toLocaleString() };
          if (s.title === 'Pending Payments') return { ...s, value: pendingPayments.length.toLocaleString() };
          return s;
        }));
      }
    });

    onValue(ordersRef, (snapshot) => {
      const orders = snapshot.val();
      if (orders) {
        const ordersArray = Object.entries(orders).map(([id, val]: [string, any]) => ({ id, ...val }));
        const orderCount = ordersArray.length;
        const totalProfit = ordersArray.reduce((acc, curr) => acc + (curr.profit || 0), 0);
        const totalCost = ordersArray.reduce((acc, curr) => acc + (curr.originalCost || 0), 0);

        setStats(prev => prev.map(s => {
          if (s.title === 'Total Orders') return { ...s, value: orderCount.toLocaleString() };
          if (s.title === 'Total Profit') return { ...s, value: `UGX ${Math.round(totalProfit).toLocaleString()}` };
          return s;
        }));

        setSecondaryStats(prev => prev.map(s => s.title === 'API Cost' ? { ...s, value: `UGX ${Math.round(totalCost).toLocaleString()}` } : s));

        // Recent orders
        const sorted = ordersArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        setRecentOrders(sorted);

        // Popular Services Analytics
        const serviceCounts: Record<string, { count: number, revenue: number }> = {};
        ordersArray.forEach(order => {
          const name = order.service || 'Unknown';
          if (!serviceCounts[name]) serviceCounts[name] = { count: 0, revenue: 0 };
          serviceCounts[name].count += 1;
          serviceCounts[name].revenue += (order.price || 0);
        });

        const popular = Object.entries(serviceCounts)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setPopularServices(popular);

        // Chart Data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const dailyData = last7Days.map(date => {
          const dayOrders = ordersArray.filter(o => o.createdAt.startsWith(date));
          return {
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            orders: dayOrders.length,
            revenue: dayOrders.reduce((acc, curr) => acc + (curr.price || 0), 0),
            profit: dayOrders.reduce((acc, curr) => acc + (curr.profit || 0), 0),
          };
        });
        setChartData(dailyData);
      }
      setIsLoading(false);
    });
  }, []);

  const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E'];

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tighter mb-2">Admin Panel</h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Platform Analytics & Management</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Last updated: <span className="text-gray-900">Just now</span>
          </div>
          <button 
            onClick={() => {
              setIsLoading(true);
              fetchProviderBalance();
              toast.success('Data refreshed');
            }}
            className="flex-grow md:flex-grow-0 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSync} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Provider Balance Monitor */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/4 -translate-y-1/4 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl text-brand-purple border border-white/10">
              <FontAwesomeIcon icon={faWallet} />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black tracking-tighter mb-1">Provider Balance</h3>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">SMM API Funds Monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center md:text-right">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">USD Balance</div>
              <div className="text-3xl font-display font-black text-white tracking-tighter">${providerBalance.usd.toLocaleString()}</div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block" />
            <div className="text-center md:text-right">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">UGX Equivalent</div>
              <div className="text-3xl font-display font-black text-emerald-400 tracking-tighter">UGX {providerBalance.ugx.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-brand-purple/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 shadow-sm border border-gray-50`}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div className={`flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                <FontAwesomeIcon icon={stat.isUp ? faArrowUp : faArrowDown} />
                <span>{stat.trend}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-display font-black text-gray-900 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.title}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {secondaryStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.color} bg-gray-50`}>
              <FontAwesomeIcon icon={stat.icon} />
            </div>
            <div>
              <div className="text-lg font-black text-gray-900 tracking-tight">{stat.value}</div>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
          <h3 className="text-2xl font-display font-black text-gray-900 tracking-tighter mb-10">Revenue & Profit</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'black', fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'black', fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'black', fontSize: '10px', color: '#111'}}
                  itemStyle={{color: '#111'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
          <h3 className="text-2xl font-display font-black text-gray-900 tracking-tighter mb-10">Top 10 Services</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularServices} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#00000005" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 'black', fill: '#9ca3af'}} width={120} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'black', fontSize: '10px', color: '#111'}}
                />
                <Bar dataKey="count" fill="#7C3AED" radius={[0, 12, 12, 0]}>
                  {popularServices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-display font-black text-gray-900 tracking-tighter">Recent Orders</h2>
            <Link to="/admin/orders" className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em] hover:text-brand-accent transition-colors">View All Orders</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                  <th className="pb-6 px-4">ID</th>
                  <th className="pb-6 px-4">User</th>
                  <th className="pb-6 px-4">Service</th>
                  <th className="pb-6 px-4">Profit</th>
                  <th className="pb-6 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order, idx) => (
                  <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-6 px-4 text-xs font-black text-gray-900">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="py-6 px-4 text-xs font-bold text-gray-500">{order.userName || order.userEmail}</td>
                    <td className="py-6 px-4 text-xs font-bold text-gray-400 truncate max-w-[150px]">{order.service}</td>
                    <td className="py-6 px-4 text-xs font-black text-emerald-500">UGX {Math.round(order.profit || 0).toLocaleString()}</td>
                    <td className="py-6 px-4">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        order.status === 'Processing' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-amber-500/10 text-amber-500'
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

        {/* System Health */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-gray-900 p-10 rounded-[3.5rem] text-white shadow-xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
            <h3 className="text-2xl font-display font-black tracking-tighter mb-10">System Health</h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                  <span>API Success Rate</span>
                  <span>99.9%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-emerald-500 w-[99.9%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                  <span>Server Load</span>
                  <span>18%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-brand-blue w-[18%] shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                  <span>Database Latency</span>
                  <span>42ms</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-brand-purple w-[42%] shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter mb-8">Quick Links</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Users', path: '/admin/users' },
                { name: 'Services', path: '/admin/services' },
                { name: 'Payments', path: '/admin/payments' },
                { name: 'Settings', path: '/admin/settings' }
              ].map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="p-4 rounded-2xl bg-gray-50 hover:bg-brand-purple/10 hover:text-brand-purple transition-all text-[10px] font-black uppercase tracking-widest text-gray-400 text-center border border-gray-100"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
