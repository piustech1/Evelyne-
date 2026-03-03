import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faChartLine, faChartPie, faArrowUp, faArrowDown, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function AdminReports() {
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orderVolumeData, setOrderVolumeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const paymentsRef = ref(db, 'payments');

    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.values(data);
        setOrders(ordersArray);
        processOrderData(ordersArray);
      }
    });

    onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const paymentsArray = Object.values(data);
        setPayments(paymentsArray);
        processRevenueData(paymentsArray);
      }
      setIsLoading(false);
    });
  }, []);

  const processRevenueData = (data: any[]) => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => {
      const dailyRevenue = data
        .filter(p => p.status === 'Approved' && p.createdAt.startsWith(date))
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      
      return {
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dailyRevenue
      };
    });

    setRevenueData(chartData);
  };

  const processOrderData = (data: any[]) => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => {
      const dailyOrders = data.filter(o => o.createdAt.startsWith(date)).length;
      return {
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        orders: dailyOrders
      };
    });

    setOrderVolumeData(chartData);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter mb-2">Reports</h1>
          <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">In-depth analytics and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-6 py-3 bg-brand-card rounded-2xl border border-white/5 shadow-xl text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-brand-purple" />
            <span>Last 7 Days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-card p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-display font-black text-white tracking-tighter mb-1">Revenue Analysis</h3>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Daily earnings from deposits</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
              <FontAwesomeIcon icon={faArrowUp} />
              <span>Growth</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 900, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-card p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-display font-black text-white tracking-tighter mb-1">Order Volume</h3>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Daily order placements</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/10 px-4 py-2 rounded-full border border-brand-blue/20">
              <FontAwesomeIcon icon={faChartBar} />
              <span>Activity</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ color: '#38bdf8', fontWeight: 900, fontSize: '12px' }}
                />
                <Bar dataKey="orders" radius={[10, 10, 0, 0]}>
                  {orderVolumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === orderVolumeData.length - 1 ? '#38bdf8' : '#38bdf844'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
