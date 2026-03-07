import { useState, useEffect, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faWallet, faSignOutAlt, faShieldAlt, faBell, faCog, faCheckCircle, faPlus, faHistory, faBolt, faArrowRight, faRocket, faLock, faChevronRight, faCopy, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { auth, db } from '../lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { ref, update, onValue, query, orderByChild, equalTo } from 'firebase/database';

export default function Profile() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, completed: 0 });

  const referralLink = `${window.location.origin}/signup?ref=${userData?.username || ''}`;

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
    }
  }, [userData]);

  const copyReferralLink = () => {
    if (userData?.username) {
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied!');
    }
  };

  const shareReferral = async () => {
    if (userData?.username) {
      const text = `Join EasyBoost and grow your social media instantly! \n\nSign up here: ${referralLink}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'EasyBoost Referral',
            text: text,
            url: referralLink,
          });
        } catch (err) {
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    }
  };

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
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
      toast.error('Logout failed');
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    const loadingToast = toast.loading('Updating profile...');

    try {
      await updateProfile(user, { displayName: name });
      await update(ref(db, `users/${user.uid}`), { name });
      toast.success('Profile updated successfully!', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile', { id: loadingToast });
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
    <div className="pt-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Profile Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[160px] md:h-[180px] gradient-brand rounded-3xl p-6 md:p-10 text-white overflow-hidden shadow-lg flex flex-col justify-center"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/4 -translate-y-1/4 blur-3xl" />
        
        <div className="relative z-10 flex items-center space-x-4 md:space-x-8">
          <div className="relative">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-2xl border border-white/20 flex items-center justify-center shadow-inner overflow-hidden">
              <img 
                src="https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-brand-blue flex items-center justify-center text-white text-[8px] shadow-lg">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-display font-black tracking-tighter capitalize mb-1">
                  {userData?.name || 'User'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-black opacity-70 uppercase tracking-widest">
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-1.5" />
                    {user?.email}
                  </span>
                  <span className="hidden md:inline opacity-30">|</span>
                  <span>ID: #{user?.uid.slice(-6).toUpperCase()}</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[8px] font-black">VIP</span>
                </div>
              </div>
              
              <div className="hidden md:block text-right">
                <div className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Balance</div>
                <div className="text-2xl font-display font-black tracking-tighter">UGX {userData?.balance?.toLocaleString() || 0}</div>
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
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.path}
                  className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-brand-purple/30 transition-all group text-center hover-lift active-press"
                >
                  <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                    <FontAwesomeIcon icon={action.icon} className="text-xs" />
                  </div>
                  <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">{action.title}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section>
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Account Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm hover-lift transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-gray-400 text-[10px] border border-gray-100 shadow-sm">
                      <FontAwesomeIcon icon={stat.icon} />
                    </div>
                  </div>
                  <div className="text-base font-black text-gray-900 mb-0.5 tracking-tight">{stat.value}</div>
                  <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Referral Link Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 p-6 md:p-10 rounded-3xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter">Referral Program</h3>
              <div className="px-3 py-1 bg-brand-purple/10 text-brand-purple text-[8px] font-black uppercase tracking-widest rounded-full">Earn Rewards</div>
            </div>
            
            <div className="space-y-6">
              <p className="text-gray-500 text-xs font-medium leading-relaxed">
                Invite your friends to EasyBoost and earn rewards for every successful referral. Your friends also get a special welcome bonus!
              </p>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left w-full overflow-hidden">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Referral Link</p>
                  <p className="text-xs font-bold text-brand-purple truncate">{referralLink}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={copyReferralLink}
                    className="flex-1 sm:flex-none h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl flex items-center justify-center gap-2 transition-all active-press text-[10px] font-black uppercase tracking-widest"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                    Copy
                  </button>
                  <button 
                    onClick={shareReferral}
                    className="flex-1 sm:flex-none h-10 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all active-press text-[10px] font-black uppercase tracking-widest shadow-sm"
                  >
                    <FontAwesomeIcon icon={faShareAlt} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Details Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 p-6 md:p-10 rounded-3xl shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter mb-8">Edit Profile</h3>
            
            <form className="space-y-8" onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold text-xs shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed font-bold text-xs shadow-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-sm hover:scale-[1.02] active-press transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Sidebar: Security & Logout */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-gray-900 p-8 rounded-3xl text-white space-y-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
            
            <div>
              <h3 className="text-xl font-display font-black tracking-tighter mb-1">Security</h3>
              <p className="text-white/50 text-[8px] font-black uppercase tracking-widest">Manage protection</p>
            </div>

            <div className="space-y-3">
              <button className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-between transition-all group border border-white/5 active-press">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/10">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-xs" />
                  </div>
                  <span className="text-xs font-bold">Two-Factor Auth</span>
                </div>
                <div className="w-8 h-4 bg-black/20 rounded-full relative">
                  <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white/20 rounded-full" />
                </div>
              </button>
              <button className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-between transition-all group border border-white/5 active-press">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/10">
                    <FontAwesomeIcon icon={faBell} className="text-xs" />
                  </div>
                  <span className="text-xs font-bold">Notifications</span>
                </div>
                <div className="w-8 h-4 bg-purple-600 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                </div>
              </button>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full py-4 rounded-xl bg-rose-500/10 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center space-x-2 group border border-rose-500/20 active-press"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="group-hover:-translate-x-1 transition-transform" />
                <span>Logout Account</span>
              </button>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 text-xl mx-auto mb-4 border border-gray-100 shadow-sm">
              <FontAwesomeIcon icon={faRocket} />
            </div>
            <h4 className="text-xl font-display font-black text-gray-900 tracking-tighter mb-2">Need Help?</h4>
            <p className="text-gray-400 text-[10px] font-medium mb-6 leading-relaxed">Our support team is available 24/7 to assist you.</p>
            <button 
              onClick={() => window.open('https://wa.me/256709728323?text=Easy%20Boost%20user', '_blank')}
              className="w-full py-3 bg-white text-gray-900 font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all border border-gray-200 shadow-sm active-press"
            >
              Contact Support
            </button>
          </div>
        </div>

        <div className="text-center pt-8">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
            Powered by Pius Tech
          </p>
        </div>
      </div>
    </div>
  );
}
