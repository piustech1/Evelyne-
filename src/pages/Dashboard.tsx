import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faShoppingCart, faClock, faCheckCircle, faPlus, faArrowRight, faRocket, faChartLine, faBolt, faShieldAlt, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faTiktok, faYoutube, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const stats = [
  { title: 'Balance', value: 'UGX 0', icon: faWallet, color: 'text-blue-500', bg: 'bg-blue-50' },
  { title: 'Total Orders', value: '0', icon: faShoppingCart, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  { title: 'Pending', value: '0', icon: faClock, color: 'text-amber-500', bg: 'bg-amber-50' },
  { title: 'Completed', value: '0', icon: faCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const platforms = [
  { id: 'instagram', icon: faInstagram, name: 'Instagram', color: 'text-[#E1306C]', bg: 'bg-[#E1306C]/10', desc: 'Followers, Likes, Views' },
  { id: 'tiktok', icon: faTiktok, name: 'TikTok', color: 'text-black', bg: 'bg-gray-100', desc: 'Followers, Likes, Shares' },
  { id: 'youtube', icon: faYoutube, name: 'YouTube', color: 'text-[#FF0000]', bg: 'bg-[#FF0000]/10', desc: 'Subs, Views, Watch Time' },
  { id: 'facebook', icon: faFacebook, name: 'Facebook', color: 'text-[#1877F2]', bg: 'bg-[#1877F2]/10', desc: 'Page Likes, Post Likes' },
];

const recentOrders: any[] = [];

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{"email": "user@example.com"}');
  const userName = user.email.split('@')[0];

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-[160px] md:min-h-[200px] gradient-brand rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl shadow-brand-orange/20 flex items-center px-6 md:px-12"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl" />
        
        <div className="relative z-10 w-full flex items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl md:text-4xl font-display font-bold text-white capitalize">
              Hey, {userName}
            </h1>
            <p className="text-white/80 font-medium text-xs md:text-base max-w-[180px] md:max-w-md leading-tight">
              Your social media growth starts here. What are we boosting today?
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Link
              to="/wallet"
              className="px-4 md:px-8 py-3 md:py-4 bg-white text-brand-orange font-bold rounded-xl md:rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95 text-xs md:text-base flex items-center gap-2 whitespace-nowrap"
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
            className="bg-white p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-brand-orange/5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className={`w-8 h-8 md:w-12 md:h-12 ${stat.bg} ${stat.color} rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl transition-transform group-hover:scale-110 shadow-sm`}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.title}</span>
            </div>
            <div className="text-lg md:text-xl font-display font-bold text-brand-dark">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          {/* Platforms Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-brand-dark flex items-center tracking-tight">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faThLarge} className="text-brand-orange" />
                </div>
                Select Platform
              </h2>
              <Link to="/services" className="text-sm font-bold text-brand-orange hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {platforms.map((platform, idx) => (
                <Link
                  key={idx}
                  to={`/services/${platform.id}`}
                  className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center space-x-5 hover:border-brand-orange/30 hover:shadow-2xl hover:shadow-brand-orange/5 transition-all group relative overflow-hidden"
                >
                  <div className={`absolute -right-4 -top-4 w-20 h-20 ${platform.bg} opacity-0 group-hover:opacity-100 rounded-full blur-2xl transition-opacity`} />
                  
                  <div className={`w-16 h-16 ${platform.bg} ${platform.color} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm relative z-10`}>
                    <FontAwesomeIcon icon={platform.icon} />
                  </div>
                  <div className="flex-grow relative z-10">
                    <div className="text-lg font-bold text-brand-dark group-hover:text-brand-orange transition-colors">{platform.name}</div>
                    <div className="text-xs text-gray-400 font-medium">{platform.desc}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-brand-orange group-hover:text-white transition-all relative z-10">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Info Card */}
          <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="w-20 h-20 bg-brand-orange/10 rounded-3xl flex items-center justify-center text-brand-orange text-4xl shadow-inner">
              <FontAwesomeIcon icon={faRocket} />
            </div>
            <div className="text-center md:text-left space-y-3 relative z-10">
              <h3 className="text-2xl font-bold text-brand-dark tracking-tight">Boost Your Growth Instantly</h3>
              <p className="text-gray-500 text-sm md:text-base max-w-md leading-relaxed">
                Select a platform above to see our high-quality services. We offer the fastest delivery and most competitive prices in the market.
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          {/* Recent Orders */}
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-brand-dark tracking-tight">Recent Activity</h2>
              <Link to="/orders" className="text-xs font-bold text-brand-orange hover:underline">View History</Link>
            </div>
            <div className="space-y-5">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-brand-light/50 border border-transparent hover:border-brand-orange/10 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm shadow-sm transition-transform group-hover:scale-110 ${
                        order.status === 'Completed' ? 'bg-emerald-500' : 
                        order.status === 'Processing' ? 'bg-blue-500' : 'bg-amber-500'
                      }`}>
                        <FontAwesomeIcon icon={order.status === 'Completed' ? faCheckCircle : faClock} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-brand-dark truncate max-w-[140px]">{order.service}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{order.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-brand-dark">{order.price}</div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${
                        order.status === 'Completed' ? 'text-emerald-500' : 
                        order.status === 'Processing' ? 'text-blue-500' : 'text-amber-500'
                      }`}>{order.status}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No orders yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Support Card */}
          <section className="p-10 rounded-[3rem] bg-brand-dark text-white relative overflow-hidden shadow-2xl shadow-brand-dark/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/30">
                <FontAwesomeIcon icon={faShieldAlt} className="text-2xl" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-2xl tracking-tight">24/7 Support</h3>
                <p className="text-sm text-white/60 leading-relaxed">Need help with an order or have a question? Our team is here for you.</p>
              </div>
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all flex items-center justify-center group border border-white/10">
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
