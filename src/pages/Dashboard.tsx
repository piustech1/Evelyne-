import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faShoppingCart, faClock, faCheckCircle, faPlus, faArrowRight, faRocket, faShieldAlt, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faTiktok, faYoutube, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, onValue, query, orderByChild, limitToLast, equalTo } from 'firebase/database';

const platforms = [
  { id: 'instagram', icon: faInstagram, name: 'Instagram', color: 'text-[#E1306C]', bg: 'bg-[#E1306C]/10', desc: 'Followers, Likes, Views' },
  { id: 'tiktok', icon: faTiktok, name: 'TikTok', color: 'text-white', bg: 'bg-white/10', desc: 'Followers, Likes, Shares' },
  { id: 'youtube', icon: faYoutube, name: 'YouTube', color: 'text-[#FF0000]', bg: 'bg-[#FF0000]/10', desc: 'Subs, Views, Watch Time' },
  { id: 'facebook', icon: faFacebook, name: 'Facebook', color: 'text-[#1877F2]', bg: 'bg-[#1877F2]/10', desc: 'Page Likes, Post Likes' },
];

export default function Dashboard() {
  const { user, userData } = useAuth();
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const ordersRef = ref(db, 'orders');
      const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(user.uid));
      
      onValue(userOrdersQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const ordersArray = Object.values(data);
          const total = ordersArray.length;
          const pending = ordersArray.filter((o: any) => o.status === 'Pending' || o.status === 'Processing').length;
          const completed = ordersArray.filter((o: any) => o.status === 'Completed').length;
          
          setOrderStats({ total, pending, completed });
          
          // Get last 5 orders
          const sorted = ordersArray.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ).slice(0, 5);
          setRecentOrders(sorted);
        }
      });
    }
  }, [user]);

  const stats = [
    { title: 'Balance', value: `UGX ${userData?.balance?.toLocaleString() || 0}`, icon: faWallet, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
    { title: 'Total Orders', value: orderStats.total.toString(), icon: faShoppingCart, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    { title: 'Pending', value: orderStats.pending.toString(), icon: faClock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Completed', value: orderStats.completed.toString(), icon: faCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-[160px] md:min-h-[200px] gradient-brand rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl shadow-brand-blue/20 flex items-center px-6 md:px-12"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl" />
        
        <div className="relative z-10 w-full flex items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl md:text-4xl font-display font-black text-white capitalize tracking-tighter">
              Hey, {userData?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-white/80 font-medium text-xs md:text-base max-w-[180px] md:max-w-md leading-tight">
              Your social media growth starts here. What are we boosting today?
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Link
              to="/wallet"
              className="px-4 md:px-8 py-3 md:py-4 bg-white text-brand-blue font-black rounded-xl md:rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95 text-xs md:text-base flex items-center gap-2 whitespace-nowrap uppercase tracking-widest"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Funds</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-brand-card p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-white/5 hover:border-brand-purple/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3 md:mb-5">
              <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} ${stat.color} rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl transition-transform group-hover:scale-110 shadow-sm`}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.title}</span>
            </div>
            <div className="text-xl md:text-2xl font-display font-black text-white tracking-tight">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          {/* Platforms Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-white flex items-center tracking-tighter">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faThLarge} className="text-brand-blue" />
                </div>
                Select Platform
              </h2>
              <Link to="/services" className="text-xs font-black text-brand-purple hover:text-brand-accent uppercase tracking-widest">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {platforms.map((platform, idx) => (
                <Link
                  key={idx}
                  to={`/services/${platform.id}`}
                  className="bg-brand-card p-6 rounded-[2.5rem] shadow-xl border border-white/5 flex items-center space-x-5 hover:border-brand-purple/30 transition-all group relative overflow-hidden"
                >
                  <div className={`absolute -right-4 -top-4 w-20 h-20 ${platform.bg} opacity-0 group-hover:opacity-100 rounded-full blur-2xl transition-opacity`} />
                  
                  <div className={`w-16 h-16 ${platform.bg} ${platform.color} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm relative z-10`}>
                    <FontAwesomeIcon icon={platform.icon} />
                  </div>
                  <div className="flex-grow relative z-10">
                    <div className="text-lg font-black text-white group-hover:text-brand-purple transition-colors tracking-tight">{platform.name}</div>
                    <div className="text-xs text-gray-500 font-medium">{platform.desc}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:gradient-brand group-hover:text-white transition-all relative z-10 border border-white/5">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Info Card */}
          <section className="bg-brand-card p-8 md:p-10 rounded-[3rem] shadow-xl border border-white/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="w-20 h-20 bg-brand-blue/10 rounded-3xl flex items-center justify-center text-brand-blue text-4xl shadow-inner border border-brand-blue/10">
              <FontAwesomeIcon icon={faRocket} />
            </div>
            <div className="text-center md:text-left space-y-3 relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tighter">Boost Your Growth Instantly</h3>
              <p className="text-gray-400 text-sm md:text-base max-w-md leading-relaxed">
                Select a platform above to see our high-quality services. We offer the fastest delivery and most competitive prices in the market.
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          {/* Recent Orders */}
          <section className="bg-brand-card p-8 rounded-[3rem] shadow-xl border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-white tracking-tighter">Recent Activity</h2>
              <Link to="/orders" className="text-[10px] font-black text-brand-purple hover:text-brand-accent uppercase tracking-widest">View History</Link>
            </div>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-purple/20 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs shadow-sm transition-transform group-hover:scale-110 ${
                        order.status === 'Completed' ? 'bg-emerald-500' : 
                        order.status === 'Processing' ? 'bg-brand-blue' : 'bg-amber-500'
                      }`}>
                        <FontAwesomeIcon icon={order.status === 'Completed' ? faCheckCircle : faClock} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[120px]">{order.service}</div>
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">UGX {order.price || 0}</div>
                      <div className={`text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'Completed' ? 'text-emerald-500' : 
                        order.status === 'Processing' ? 'text-brand-blue' : 'text-amber-500'
                      }`}>{order.status}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No orders yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Support Card */}
          <section className="p-10 rounded-[3rem] bg-gradient-to-br from-brand-blue to-brand-purple text-white relative overflow-hidden shadow-2xl shadow-brand-blue/20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                <FontAwesomeIcon icon={faShieldAlt} className="text-2xl" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-2xl tracking-tighter">24/7 Support</h3>
                <p className="text-sm text-white/70 leading-relaxed font-medium">Need help with an order or have a question? Our team is here for you.</p>
              </div>
              <button className="w-full py-4 bg-white text-brand-blue hover:bg-white/90 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center group shadow-xl">
                Contact Us
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
