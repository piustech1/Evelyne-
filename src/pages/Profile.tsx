import { useState, useEffect, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faWallet, faSignOutAlt, faShieldAlt, faBell, faCog, faCheckCircle, faPlus, faHistory, faBolt, faArrowRight, faRocket } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth, db } from '../lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { ref, update, onValue, query, orderByChild, equalTo } from 'firebase/database';

export default function Profile() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
    }
  }, [userData]);

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
        }
      });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(user, { displayName: name });
      await update(ref(db, `users/${user.uid}`), { name });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { title: 'Add Funds', icon: faPlus, path: '/wallet', color: 'bg-emerald-500' },
    { title: 'View Orders', icon: faHistory, path: '/orders', color: 'bg-brand-blue' },
    { title: 'Boost Now', icon: faBolt, path: '/services', color: 'bg-brand-purple' },
    { title: 'Settings', icon: faCog, path: '#', color: 'bg-gray-700' },
  ];

  const stats = [
    { label: 'Total Orders', value: orderStats.total.toString(), icon: faHistory },
    { label: 'Completed', value: orderStats.completed.toString(), icon: faCheckCircle },
    { label: 'Pending', value: orderStats.pending.toString(), icon: faBolt },
    { label: 'Balance', value: `UGX ${userData?.balance?.toLocaleString() || 0}`, icon: faWallet },
  ];

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Profile Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[200px] md:h-[240px] gradient-brand rounded-[3.5rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl shadow-brand-blue/20 flex flex-col justify-center border border-white/10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/4 -translate-y-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl" />
        
        <div className="relative z-10 flex items-center space-x-6 md:space-x-12">
          <div className="relative">
            <div className="w-20 h-20 md:w-32 md:h-32 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 flex items-center justify-center text-3xl md:text-5xl shadow-inner">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl border-4 border-brand-blue flex items-center justify-center text-white text-[10px] shadow-lg">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-display font-black tracking-tighter capitalize mb-2">
                  {userData?.name || 'User'}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-black opacity-70 uppercase tracking-widest">
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                    {user?.email}
                  </span>
                  <span className="hidden md:inline opacity-30">|</span>
                  <span>ID: #{user?.uid.slice(-6).toUpperCase()}</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black">VIP MEMBER</span>
                </div>
              </div>
              
              <div className="hidden md:block text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Available Balance</div>
                <div className="text-4xl font-display font-black tracking-tighter">UGX {userData?.balance?.toLocaleString() || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Quick Actions & Stats */}
        <div className="lg:col-span-8 space-y-10">
          {/* Quick Actions Grid */}
          <section>
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 ml-2">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.path}
                  className="bg-brand-card p-6 rounded-[2.5rem] border border-white/5 shadow-xl hover:border-brand-purple/30 hover:-translate-y-1 transition-all group text-center"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform border border-white/10`}>
                    <FontAwesomeIcon icon={action.icon} />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{action.title}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section>
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 ml-2">Account Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-brand-card p-6 rounded-[2.5rem] border border-white/5 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 text-xs border border-white/5">
                      <FontAwesomeIcon icon={stat.icon} />
                    </div>
                  </div>
                  <div className="text-lg font-black text-white mb-1 tracking-tight">{stat.value}</div>
                  <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Account Details Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-brand-card p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5"
          >
            <h3 className="text-2xl font-display font-black text-white tracking-tighter mb-10">Edit Profile</h3>
            
            {message.text && (
              <div className={`mb-8 p-4 rounded-2xl text-xs font-bold text-center border ${
                message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              }`}>
                {message.text}
              </div>
            )}

            <form className="space-y-10" onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="block w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="block w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 cursor-not-allowed font-bold text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-10 py-5 gradient-brand text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Sidebar: Security & Logout */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-brand-dark p-10 rounded-[3.5rem] text-white space-y-10 shadow-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
            
            <div>
              <h3 className="text-2xl font-display font-black tracking-tighter mb-2">Security</h3>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Manage your protection</p>
            </div>

            <div className="space-y-4">
              <button className="w-full p-6 rounded-[2rem] bg-white/5 hover:bg-white/10 flex items-center justify-between transition-all group border border-white/5">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple border border-brand-purple/10">
                    <FontAwesomeIcon icon={faShieldAlt} />
                  </div>
                  <span className="text-sm font-bold">Two-Factor Auth</span>
                </div>
                <div className="w-10 h-5 bg-gray-800 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white/20 rounded-full" />
                </div>
              </button>
              <button className="w-full p-6 rounded-[2rem] bg-white/5 hover:bg-white/10 flex items-center justify-between transition-all group border border-white/5">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue border border-brand-blue/10">
                    <FontAwesomeIcon icon={faBell} />
                  </div>
                  <span className="text-sm font-bold">Notifications</span>
                </div>
                <div className="w-10 h-5 bg-brand-purple rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </button>
            </div>

            <div className="pt-6">
              <button
                onClick={handleLogout}
                className="w-full py-5 rounded-2xl bg-rose-500/10 text-rose-500 font-black uppercase tracking-widest text-xs hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center space-x-3 group border border-rose-500/20"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="group-hover:-translate-x-1 transition-transform" />
                <span>Logout Account</span>
              </button>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-brand-card p-10 rounded-[3.5rem] border border-white/5 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
            <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue text-2xl mx-auto mb-6 border border-brand-blue/10">
              <FontAwesomeIcon icon={faRocket} />
            </div>
            <h4 className="text-2xl font-display font-black text-white tracking-tighter mb-3">Need Help?</h4>
            <p className="text-gray-500 text-xs font-medium mb-8 leading-relaxed">Our expert support team is available 24/7 to assist you with any questions.</p>
            <button className="w-full py-4 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:gradient-brand transition-all border border-white/10">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
