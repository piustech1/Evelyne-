import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faWallet, faSignOutAlt, faShieldAlt, faBell, faCog, faCheckCircle, faPlus, faHistory, faBolt, faArrowRight, faRocket } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';

interface ProfileProps {
  setIsLoggedIn: (val: boolean) => void;
}

export default function Profile({ setIsLoggedIn }: ProfileProps) {
  const user = JSON.parse(localStorage.getItem('user') || '{"email": "user@example.com"}');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  const quickActions = [
    { title: 'Add Funds', icon: faPlus, path: '/wallet', color: 'bg-emerald-500' },
    { title: 'View Orders', icon: faHistory, path: '/orders', color: 'bg-blue-500' },
    { title: 'Boost Now', icon: faBolt, path: '/services', color: 'bg-brand-orange' },
    { title: 'Settings', icon: faCog, path: '#', color: 'bg-gray-500' },
  ];

  const stats = [
    { label: 'Total Orders', value: '0', icon: faHistory },
    { label: 'Completed', value: '0', icon: faCheckCircle },
    { label: 'Pending', value: '0', icon: faBolt },
    { label: 'Balance', value: 'UGX 0', icon: faWallet },
  ];

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Profile Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[200px] md:h-[220px] gradient-brand rounded-[3rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl shadow-brand-orange/30 flex flex-col justify-center"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/4 -translate-y-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl" />
        
        <div className="relative z-10 flex items-center space-x-6 md:space-x-10">
          <div className="relative">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-white/20 backdrop-blur-xl rounded-[2rem] border border-white/30 flex items-center justify-center text-3xl md:text-5xl shadow-inner">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl border-4 border-brand-orange flex items-center justify-center text-white text-[10px] shadow-lg">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-black tracking-tighter capitalize mb-1">
                  {user.email.split('@')[0]}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest">
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                    {user.email}
                  </span>
                  <span className="hidden md:inline opacity-40">|</span>
                  <span>ID: #EB-48291</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[10px]">VIP MEMBER</span>
                </div>
              </div>
              
              <div className="hidden md:block text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Available Balance</div>
                <div className="text-3xl font-display font-black">UGX 0</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Actions & Stats */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Actions Grid */}
          <section>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-2">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.path}
                  className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-center"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <FontAwesomeIcon icon={action.icon} />
                  </div>
                  <span className="text-xs font-black text-brand-dark uppercase tracking-widest">{action.title}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-2">Account Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                      <FontAwesomeIcon icon={stat.icon} />
                    </div>
                  </div>
                  <div className="text-lg font-black text-brand-dark mb-0.5">{stat.value}</div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Account Details Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50"
          >
            <h3 className="text-xl font-display font-black text-brand-dark tracking-tighter mb-8">Edit Profile</h3>
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="block w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-dark focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="block w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-dark focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-10 py-4 gradient-brand text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-orange/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Update Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Sidebar: Security & Logout */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-brand-dark p-10 rounded-[3rem] text-white space-y-8 shadow-2xl shadow-brand-dark/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
            
            <div>
              <h3 className="text-xl font-display font-black tracking-tighter mb-2">Security</h3>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Manage your protection</p>
            </div>

            <div className="space-y-3">
              <button className="w-full p-5 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-between transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                    <FontAwesomeIcon icon={faShieldAlt} />
                  </div>
                  <span className="text-sm font-bold">Two-Factor Auth</span>
                </div>
                <div className="w-10 h-5 bg-gray-700 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white/40 rounded-full" />
                </div>
              </button>
              <button className="w-full p-5 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-between transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                    <FontAwesomeIcon icon={faBell} />
                  </div>
                  <span className="text-sm font-bold">Notifications</span>
                </div>
                <div className="w-10 h-5 bg-brand-orange rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </button>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full py-5 rounded-2xl bg-rose-500/10 text-rose-500 font-black uppercase tracking-widest text-xs hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center space-x-3 group"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="group-hover:-translate-x-1 transition-transform" />
                <span>Logout Account</span>
              </button>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand-orange text-2xl mx-auto mb-4">
              <FontAwesomeIcon icon={faRocket} />
            </div>
            <h4 className="text-lg font-display font-black text-brand-dark tracking-tighter mb-2">Need Help?</h4>
            <p className="text-gray-400 text-xs font-bold mb-6">Our support team is available 24/7 to assist you.</p>
            <button className="w-full py-4 bg-gray-50 text-brand-dark font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-brand-orange hover:text-white transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
