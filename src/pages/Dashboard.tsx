import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faShoppingCart, faClock, faCheckCircle, faPlus, faArrowRight, faRocket, faShieldAlt, faThLarge, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faTiktok, faYoutube, faFacebook, faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, onValue, query, orderByChild, limitToLast, equalTo } from 'firebase/database';

const platforms = [
  { id: 'TikTok', icon: faTiktok, name: 'TikTok', color: 'text-black', bg: 'bg-gray-100', desc: 'Followers, Likes, Shares' },
  { id: 'Facebook', icon: faFacebook, name: 'Facebook', color: 'text-[#1877F2]', bg: 'bg-[#1877F2]/10', desc: 'Page Likes, Post Likes' },
  { id: 'Instagram', icon: faInstagram, name: 'Instagram', color: 'text-[#E1306C]', bg: 'bg-[#E1306C]/10', desc: 'Followers, Likes, Views' },
  { id: 'YouTube', icon: faYoutube, name: 'YouTube', color: 'text-[#FF0000]', bg: 'bg-[#FF0000]/10', desc: 'Subs, Views, Watch Time' },
  { id: 'Telegram', icon: faTelegram, name: 'Telegram', color: 'text-[#0088cc]', bg: 'bg-[#0088cc]/10', desc: 'Members, Views, Reactions' },
  { id: 'Twitter', icon: faTwitter, name: 'Twitter', color: 'text-[#1DA1F2]', bg: 'bg-[#1DA1F2]/10', desc: 'Followers, Retweets, Likes' },
  { id: 'Others', icon: faGlobe, name: 'Others', color: 'text-gray-500', bg: 'bg-gray-100', desc: 'Spotify, LinkedIn, & More' },
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
    { title: 'Balance', value: `UGX ${userData?.balance?.toLocaleString() || 0}`, icon: faWallet, color: 'text-brand-purple', bg: 'bg-brand-purple/5' },
    { title: 'Total Orders', value: orderStats.total.toString(), icon: faShoppingCart, color: 'text-brand-blue', bg: 'bg-brand-blue/5' },
    { title: 'Pending', value: orderStats.pending.toString(), icon: faClock, color: 'text-amber-500', bg: 'bg-amber-500/5' },
    { title: 'Completed', value: orderStats.completed.toString(), icon: faCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
  ];

  return (
    <div className="pt-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-[140px] md:min-h-[160px] gradient-brand rounded-3xl overflow-hidden shadow-lg flex items-center px-6 md:px-10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        
        <div className="relative z-10 w-full flex items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <h1 className="text-xl md:text-3xl font-display font-black text-white capitalize tracking-tighter">
              Hey, {userData?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-white/80 font-medium text-[10px] md:text-sm max-w-[180px] md:max-w-md leading-tight">
              Your social media growth starts here. What are we boosting today?
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Link
              to="/wallet"
              className="px-4 md:px-6 py-2.5 md:py-3 bg-white text-brand-blue font-black rounded-xl shadow-sm hover:scale-105 transition-all active:scale-95 text-[10px] md:text-xs flex items-center gap-2 whitespace-nowrap uppercase tracking-widest"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Funds</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-gray-50 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-brand-purple/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 md:w-10 md:h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center text-sm md:text-base transition-transform group-hover:scale-110 shadow-sm border border-white`}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.title}</span>
            </div>
            <div className="text-lg md:text-xl font-display font-black text-gray-900 tracking-tight">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Platforms Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-gray-900 flex items-center tracking-tighter">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3 border border-blue-100">
                  <FontAwesomeIcon icon={faThLarge} className="text-blue-600 text-sm" />
                </div>
                Select Platform
              </h2>
              <Link to="/services" className="text-[10px] font-black text-brand-purple hover:text-brand-accent uppercase tracking-widest">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {platforms.map((platform, idx) => (
                <Link
                  key={idx}
                  to={`/platform?platform=${platform.id}`}
                  className="bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-4 hover:border-brand-purple/20 transition-all group relative overflow-hidden"
                >
                  <div className={`w-12 h-12 ${platform.bg} ${platform.color} rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm relative z-10 border border-white`}>
                    <FontAwesomeIcon icon={platform.icon} />
                  </div>
                  <div className="flex-grow relative z-10">
                    <div className="text-base font-black text-gray-900 group-hover:text-brand-purple transition-colors tracking-tight">{platform.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{platform.desc}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white transition-all relative z-10 border border-gray-200">
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Info Card */}
          <section className="bg-gray-50 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 text-3xl shadow-sm border border-gray-100">
              <FontAwesomeIcon icon={faRocket} />
            </div>
            <div className="text-center md:text-left space-y-2 relative z-10">
              <h3 className="text-xl font-black text-gray-900 tracking-tighter">Boost Your Growth Instantly</h3>
              <p className="text-gray-500 text-xs md:text-sm max-w-md leading-relaxed">
                Select a platform above to see our high-quality services. We offer the fastest delivery and most competitive prices in the market.
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Recent Orders */}
          <section className="bg-gray-50 p-6 rounded-3xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-black text-gray-900 tracking-tighter">Recent Activity</h2>
              <Link to="/orders" className="text-[9px] font-black text-brand-purple hover:text-brand-accent uppercase tracking-widest">View History</Link>
            </div>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:border-brand-purple/20 transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] shadow-sm transition-transform group-hover:scale-110 ${
                        order.status === 'Completed' ? 'bg-emerald-500' : 
                        order.status === 'Processing' ? 'bg-blue-600' : 'bg-amber-500'
                      }`}>
                        <FontAwesomeIcon icon={order.status === 'Completed' ? faCheckCircle : faClock} />
                      </div>
                      <div className="max-w-[100px]">
                        <div className="text-[10px] font-bold text-gray-900 truncate">{order.service}</div>
                        <div className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-gray-900">UGX {order.price || 0}</div>
                      <div className={`text-[8px] font-black uppercase tracking-widest ${
                        order.status === 'Completed' ? 'text-emerald-500' : 
                        order.status === 'Processing' ? 'text-blue-600' : 'text-amber-500'
                      }`}>{order.status}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-200 border border-gray-100">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">No orders yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Support Card */}
          <section className="p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden shadow-sm">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm border border-white/20">
                <FontAwesomeIcon icon={faShieldAlt} className="text-xl" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-xl tracking-tighter">24/7 Support</h3>
                <p className="text-[10px] text-white/70 leading-relaxed font-medium">Need help with an order or have a question? Our team is here for you.</p>
              </div>
              <button className="w-full py-3 bg-white text-blue-600 hover:bg-white/90 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center group shadow-sm">
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
