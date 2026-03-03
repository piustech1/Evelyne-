import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEnvelope, faRocket, faArrowRight, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is admin
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      
      if (userData && userData.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        await auth.signOut();
        setError('Access denied. You are not an administrator.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-dark overflow-hidden relative">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-purple/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />

      <div className="flex-1 flex items-center justify-center px-6 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-12"
        >
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-3 mb-12 group">
              <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-blue/30 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faRocket} className="text-white text-3xl" />
              </div>
              <span className="text-3xl font-display font-black text-white tracking-tighter">EasyAdmin</span>
            </Link>
            
            <h2 className="text-5xl font-display font-black text-white tracking-tighter mb-4">Admin Access</h2>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
              Secure Panel
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Admin Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-brand-purple transition-colors">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                    placeholder="admin@easyboost.com"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Secure Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-brand-purple transition-colors">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-6 px-4 border border-transparent text-sm font-black uppercase tracking-[0.2em] rounded-2xl text-white gradient-brand shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Enter Dashboard'}
              {!isLoading && <FontAwesomeIcon icon={faArrowRight} className="ml-3 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="text-center pt-8">
            <Link to="/login" className="text-white/40 font-black uppercase tracking-widest text-[10px] hover:text-brand-purple transition-colors">
              Return to User Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
