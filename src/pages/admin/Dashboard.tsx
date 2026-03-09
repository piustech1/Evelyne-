import { useState, useEffect, useMemo } from 'react';
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
  faExchangeAlt,
  faPaperPlane,
  faTrashAlt,
  faExclamationTriangle,
  faBell,
  faTimesCircle,
  faCalculator,
  faCoins,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { db } from '../../lib/firebase';
import { ref, onValue, query, limitToLast, remove, get, push, set, serverTimestamp } from 'firebase/database';
import toast from 'react-hot-toast';
import { smmService } from '../../services/smmService';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '0', icon: faUsers, color: 'text-brand-blue', bg: 'bg-brand-blue/10', trend: '0%', isUp: true },
    { title: 'Total Orders', value: '0', icon: faShoppingCart, color: 'text-brand-purple', bg: 'bg-brand-purple/10', trend: '0%', isUp: true },
    { title: 'Total Revenue', value: 'UGX 0', icon: faMoneyBillWave, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '0%', isUp: true },
    { title: 'Total Profit', value: 'UGX 0', icon: faChartPie, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '0%', isUp: true },
  ]);

  const [profitStats, setProfitStats] = useState([
    { title: 'Profit Today', value: 'UGX 0', icon: faChartLine, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Profit This Month', value: 'UGX 0', icon: faChartPie, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
    { title: 'Orders Today', value: '0', icon: faShoppingCart, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    { title: 'Avg Profit/Order', value: 'UGX 0', icon: faCoins, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
  const [apiConnection, setApiConnection] = useState<{ status: 'checking' | 'connected' | 'error', message?: string }>({ status: 'checking' });
  
  // Notification state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // Reset Data state
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Profit Simulator state
  const [simulator, setSimulator] = useState({
    depositUgx: 500000,
    exchangeRate: 3800,
    markupPercent: 30
  });

  const simResults = useMemo(() => {
    const providerBalance = simulator.depositUgx / simulator.exchangeRate;
    const estimatedRevenue = providerBalance * (1 + (simulator.markupPercent / 100));
    const estimatedProfit = estimatedRevenue - providerBalance;
    const estimatedOrders = Math.floor(providerBalance / 0.5); // Assuming avg order is $0.5
    
    return {
      providerBalance,
      estimatedRevenue,
      estimatedProfit,
      estimatedOrders
    };
  }, [simulator]);

  const fetchProviderBalance = async () => {
    setApiConnection({ status: 'checking' });
    try {
      const data = await smmService.getBalance();
      if (data.balance) {
        const usd = parseFloat(data.balance);
        setProviderBalance({
          usd,
          ugx: Math.round(usd * 3800)
        });
        setApiConnection({ status: 'connected' });
      } else if (data.error) {
        setApiConnection({ status: 'error', message: data.error });
      }
    } catch (error: any) {
      console.error('Failed to fetch provider balance', error);
      setApiConnection({ status: 'error', message: error.message });
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
        const approvedPayments = paymentsArray.filter(p => 
          ['approved', 'success', 'completed', 'paid', 'successful'].includes(String(p.status).toLowerCase())
        );
        const pendingPayments = paymentsArray.filter(p => 
          ['pending'].includes(String(p.status).toLowerCase())
        );
        
        const totalRevenue = approvedPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
        setStats(prev => prev.map(s => s.title === 'Total Revenue' ? { ...s, value: `UGX ${totalRevenue.toLocaleString()}` } : s));
        setSecondaryStats(prev => prev.map(s => {
          if (s.title === 'Successful Payments') return { ...s, value: approvedPayments.length.toLocaleString() };
          if (s.title === 'Pending Payments') return { ...s, value: pendingPayments.length.toLocaleString() };
          return s;
        }));
      } else {
        setStats(prev => prev.map(s => s.title === 'Total Revenue' ? { ...s, value: 'UGX 0' } : s));
        setSecondaryStats(prev => prev.map(s => {
          if (s.title === 'Successful Payments') return { ...s, value: '0' };
          if (s.title === 'Pending Payments') return { ...s, value: '0' };
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

        // Profit Analytics
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().slice(0, 7);
        
        const ordersToday = ordersArray.filter(o => o.createdAt.startsWith(today));
        const profitToday = ordersToday.reduce((acc, curr) => acc + (curr.profit || 0), 0);
        
        const ordersThisMonth = ordersArray.filter(o => o.createdAt.startsWith(thisMonth));
        const profitThisMonth = ordersThisMonth.reduce((acc, curr) => acc + (curr.profit || 0), 0);
        
        const avgProfitPerOrder = orderCount > 0 ? totalProfit / orderCount : 0;

        setStats(prev => prev.map(s => {
          if (s.title === 'Total Orders') return { ...s, value: orderCount.toLocaleString() };
          if (s.title === 'Total Profit') return { ...s, value: `UGX ${Math.round(totalProfit).toLocaleString()}` };
          return s;
        }));

        setProfitStats([
          { title: 'Profit Today', value: `UGX ${Math.round(profitToday).toLocaleString()}`, icon: faChartLine, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Profit This Month', value: `UGX ${Math.round(profitThisMonth).toLocaleString()}`, icon: faChartPie, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
          { title: 'Orders Today', value: ordersToday.length.toLocaleString(), icon: faShoppingCart, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
          { title: 'Avg Profit/Order', value: `UGX ${Math.round(avgProfitPerOrder).toLocaleString()}`, icon: faCoins, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ]);

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
      } else {
        setStats(prev => prev.map(s => {
          if (s.title === 'Total Orders') return { ...s, value: '0' };
          if (s.title === 'Total Profit') return { ...s, value: 'UGX 0' };
          return s;
        }));
        setSecondaryStats(prev => prev.map(s => s.title === 'API Cost' ? { ...s, value: 'UGX 0' } : s));
        setRecentOrders([]);
        setPopularServices([]);
        setChartData([]);
      }
      setIsLoading(false);
    });
  }, []);

  const handleSendNotification = async () => {
    if (!notifTitle || !notifMessage) {
      toast.error('Please enter title and message');
      return;
    }

    setIsSendingNotif(true);
    const loadingToast = toast.loading('Sending notifications...');

    try {
      // Get all FCM tokens
      const tokensSnapshot = await get(ref(db, 'fcm_tokens'));
      const tokensData = tokensSnapshot.val();
      
      if (!tokensData) {
        toast.error('No users found with push notifications enabled', { id: loadingToast });
        return;
      }

      const tokens = Object.values(tokensData)
        .map((t: any) => t.fcm_token)
        .filter((token): token is string => typeof token === 'string' && token.length > 0);
      
      if (tokens.length === 0) {
        toast.error('No valid push tokens found', { id: loadingToast });
        setIsSendingNotif(false);
        return;
      }
      try {
        await fetch('/api/admin/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokens,
            title: notifTitle,
            message: notifMessage,
            url: '/notifications'
          })
        });
      } catch (fcmErr) {
        console.error('FCM Backend Error:', fcmErr);
        // Continue to save in-app notifications even if push fails
      }

      // Save to in-app notifications for all users
      const usersSnapshot = await get(ref(db, 'users'));
      const usersData = usersSnapshot.val();
      
      if (usersData) {
        const userIds = Object.keys(usersData);
        const timestamp = new Date().toISOString();
        
        for (const uid of userIds) {
          const notifRef = push(ref(db, `notifications/${uid}`));
          await set(notifRef, {
            title: notifTitle,
            message: notifMessage,
            timestamp,
            read: false,
            type: 'system'
          });
        }
      }

      toast.success(`Notification sent to ${Object.keys(tokensData).length} devices!`, { id: loadingToast });
      setNotifTitle('');
      setNotifMessage('');
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification', { id: loadingToast });
    } finally {
      setIsSendingNotif(false);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    const loadingToast = toast.loading('Resetting platform data...');

    try {
      // Clear payments, orders, and notifications
      await remove(ref(db, 'payments'));
      await remove(ref(db, 'orders'));
      await remove(ref(db, 'notifications'));
      
      toast.success('Platform data reset successfully!', { id: loadingToast });
      setShowResetModal(false);
    } catch (error: any) {
      console.error('Reset failed:', error);
      toast.error('Failed to reset data', { id: loadingToast });
    } finally {
      setIsResetting(false);
    }
  };

  const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E'];

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tighter mb-2">Admin Panel</h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Platform Analytics & Management</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`hidden sm:flex items-center space-x-2 px-6 py-3 rounded-2xl border shadow-sm text-[10px] font-black uppercase tracking-widest ${
            apiConnection.status === 'connected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            apiConnection.status === 'error' ? 'bg-rose-50 text-rose-600 border-rose-100' :
            'bg-white text-gray-400 border-gray-100'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              apiConnection.status === 'connected' ? 'bg-emerald-500 animate-pulse' :
              apiConnection.status === 'error' ? 'bg-rose-500' :
              'bg-gray-300'
            }`} />
            <span>
              {apiConnection.status === 'connected' ? 'SMM API: Connected' :
               apiConnection.status === 'error' ? 'SMM API: Connection Error' :
               'SMM API: Checking...'}
            </span>
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
          {apiConnection.status === 'error' && (
            <div className="flex-grow max-w-md px-4 py-2 bg-rose-500/20 border border-rose-500/30 rounded-xl text-[9px] font-bold text-rose-200 flex items-center justify-between">
              <div>
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                {apiConnection.message}
              </div>
              <button 
                onClick={() => setShowSetupGuide(true)}
                className="ml-4 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap"
              >
                Setup Guide
              </button>
            </div>
          )}
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

      {/* Profit Analytics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {profitStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 + 0.2 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-brand-purple/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 shadow-sm border border-gray-50`}>
                <FontAwesomeIcon icon={stat.icon} />
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

      {/* Profit Simulator Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100"
      >
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center text-2xl border border-emerald-500/20">
            <FontAwesomeIcon icon={faCalculator} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-gray-900 tracking-tighter">Profit Simulator</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Estimate earnings from SMM deposits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deposit Amount (UGX)</label>
              <div className="relative">
                <input 
                  type="number"
                  value={simulator.depositUgx}
                  onChange={(e) => setSimulator(prev => ({ ...prev, depositUgx: Number(e.target.value) }))}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all font-bold text-sm"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">UGX</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Exchange Rate</label>
                <input 
                  type="number"
                  value={simulator.exchangeRate}
                  onChange={(e) => setSimulator(prev => ({ ...prev, exchangeRate: Number(e.target.value) }))}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all font-bold text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Markup %</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={simulator.markupPercent}
                    onChange={(e) => setSimulator(prev => ({ ...prev, markupPercent: Number(e.target.value) }))}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all font-bold text-sm"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
              <div className="flex items-center space-x-3 text-brand-purple">
                <FontAwesomeIcon icon={faWallet} className="text-xs" />
                <span className="text-[9px] font-black uppercase tracking-widest">Provider Balance</span>
              </div>
              <div className="text-2xl font-display font-black text-gray-900 tracking-tighter">
                ${simResults.providerBalance.toFixed(2)}
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Estimated USD in SMM Panel</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
              <div className="flex items-center space-x-3 text-blue-500">
                <FontAwesomeIcon icon={faCoins} className="text-xs" />
                <span className="text-[9px] font-black uppercase tracking-widest">Estimated Revenue</span>
              </div>
              <div className="text-2xl font-display font-black text-gray-900 tracking-tighter">
                ${simResults.estimatedRevenue.toFixed(2)}
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Total sales value in USD</p>
            </div>

            <div className="bg-emerald-500 p-6 rounded-3xl shadow-lg shadow-emerald-500/20 space-y-4">
              <div className="flex items-center space-x-3 text-white/70">
                <FontAwesomeIcon icon={faChartLine} className="text-xs" />
                <span className="text-[9px] font-black uppercase tracking-widest">Estimated Profit</span>
              </div>
              <div className="text-2xl font-display font-black text-white tracking-tighter">
                ${simResults.estimatedProfit.toFixed(2)}
              </div>
              <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">Net gain after markup</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center space-x-3 text-brand-purple">
                <FontAwesomeIcon icon={faShoppingCart} className="text-xs" />
                <span className="text-[9px] font-black uppercase tracking-widest">Orders Possible</span>
              </div>
              <div className="text-2xl font-display font-black text-white tracking-tighter">
                ~{simResults.estimatedOrders.toLocaleString()}
              </div>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Based on $0.50 avg cost</p>
            </div>
          </div>
        </div>
      </motion.div>

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

        {/* System Health & Reset */}
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

          {/* Reset Data Feature */}
          <div className="bg-rose-50 p-10 rounded-[3.5rem] border border-rose-100 shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">
                <FontAwesomeIcon icon={faTrashAlt} />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-rose-900 tracking-tighter">Reset Data</h3>
                <p className="text-rose-400 text-[8px] font-black uppercase tracking-widest">Clear history & analytics</p>
              </div>
            </div>
            <p className="text-rose-600/70 text-[10px] font-medium mb-8 leading-relaxed">
              This will permanently delete all payment history, order logs, and analytics. User accounts will NOT be deleted.
            </p>
            <button 
              onClick={() => setShowResetModal(true)}
              className="w-full py-4 bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faExclamationTriangle} />
              Reset History
            </button>
          </div>
        </div>
      </div>

      {/* Send Notification Section */}
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-14 h-14 bg-brand-purple/10 text-brand-purple rounded-2xl flex items-center justify-center text-2xl border border-brand-purple/20">
            <FontAwesomeIcon icon={faPaperPlane} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-gray-900 tracking-tighter">Send Push Notification</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Broadcast to all users</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notification Title</label>
              <input 
                type="text"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. New Services Available!"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Body</label>
              <textarea 
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={4}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all font-bold text-sm resize-none"
              />
            </div>
            <button 
              onClick={handleSendNotification}
              disabled={isSendingNotif}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faPaperPlane} className={isSendingNotif ? 'animate-bounce' : ''} />
              {isSendingNotif ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>

          <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-brand-purple text-3xl shadow-sm border border-gray-100">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter">Preview Notification</h3>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest max-w-xs mx-auto">This is how users will see it on their devices</p>
            </div>
            <div className="w-full max-w-xs bg-white p-4 rounded-2xl shadow-lg border border-gray-100 text-left space-y-2">
              <div className="flex items-center space-x-3">
                <img src="https://i.postimg.cc/sxNQyXFG/0x0.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                <div>
                  <div className="text-[10px] font-black text-gray-900">{notifTitle || 'Notification Title'}</div>
                  <div className="text-[8px] text-gray-500 font-medium line-clamp-2">{notifMessage || 'Your message will appear here...'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Guide Modal */}
      <AnimatePresence>
        {showSetupGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-2xl w-full bg-white rounded-[3rem] p-10 space-y-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-purple/10 text-brand-purple rounded-2xl flex items-center justify-center text-xl">
                    <FontAwesomeIcon icon={faSync} />
                  </div>
                  <h3 className="text-2xl font-display font-black text-gray-900 tracking-tighter">SMM API Setup Guide</h3>
                </div>
                <button onClick={() => setShowSetupGuide(false)} className="text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              </div>

              <div className="space-y-6 text-left">
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl">
                  <h4 className="text-rose-900 font-black text-xs uppercase tracking-widest mb-2">Why am I seeing a 405 error?</h4>
                  <p className="text-rose-700 text-xs leading-relaxed">
                    You are likely using a static hosting provider (like Vercel). These platforms do not support the local API proxy. To fix this, you <strong>must</strong> use the Google Apps Script (GAS) proxy.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-gray-900 font-black text-xs uppercase tracking-widest">Step 1: Deploy the Proxy</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    1. Go to <a href="https://script.google.com" target="_blank" className="text-brand-purple underline">script.google.com</a>.<br />
                    2. Create a new project.<br />
                    3. Copy the code from <code>google_apps_script.js</code> in your project root.<br />
                    4. Click <strong>Deploy &gt; New Deployment</strong>.<br />
                    5. Select <strong>Web App</strong>, set "Who has access" to <strong>Anyone</strong>.<br />
                    6. Copy the <strong>Web App URL</strong>.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-gray-900 font-black text-xs uppercase tracking-widest">Step 2: Set Environment Variable</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    1. Go to your hosting provider settings (e.g., Vercel Dashboard).<br />
                    2. Add a new Environment Variable:<br />
                    <code className="block p-3 bg-gray-100 rounded-lg mt-2 font-mono text-[10px]">VITE_SMM_GAS_URL = [Your GAS URL]</code><br />
                    3. <strong>Redeploy</strong> your application.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowSetupGuide(false)}
                className="w-full py-4 bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-800 transition-all active:scale-95"
              >
                Got it, thanks!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center space-y-8 shadow-2xl"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mx-auto border border-rose-100">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-gray-900 tracking-tighter">Are you sure?</h3>
                <p className="text-gray-500 text-xs font-medium leading-relaxed">
                  This action will permanently delete all <span className="text-rose-500 font-black">Analytics, Payment History, and Order Logs</span>. This cannot be undone.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleResetData}
                  disabled={isResetting}
                  className="w-full py-4 bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isResetting ? 'Resetting...' : 'Yes, Reset Everything'}
                </button>
                <button 
                  onClick={() => setShowResetModal(false)}
                  disabled={isResetting}
                  className="w-full py-4 bg-gray-100 text-gray-900 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
