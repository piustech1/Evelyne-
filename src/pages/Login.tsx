import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faRocket, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { motion } from 'motion/react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

export default function Login() {
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
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-dark">
      {/* Left Side: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-8 md:p-12 bg-brand-card rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/50"
        >
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
              <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faRocket} className="text-white text-lg" />
              </div>
              <span className="text-xl font-display font-black text-white tracking-tighter">EasyBoost</span>
            </Link>
            
            <h2 className="text-4xl font-display font-black text-white tracking-tighter mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">Login to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-purple transition-colors">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-purple transition-colors">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-white/5 border-white/10 text-brand-purple focus:ring-brand-purple rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-500 font-bold uppercase tracking-widest cursor-pointer">
                  Remember me
                </label>
              </div>
              <a href="#" className="font-black text-brand-purple hover:text-brand-accent transition-colors uppercase tracking-widest">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-xs font-black uppercase tracking-widest rounded-2xl text-white gradient-brand shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              {!isLoading && <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                <span className="px-4 bg-brand-card text-gray-600">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-4 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all shadow-sm disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faGoogle} className="mr-3 text-base text-brand-purple" />
              Google Account
            </button>
          </form>

          <div className="text-center pt-8">
            <p className="text-gray-500 text-xs font-medium">
              New to EasyBoost?{' '}
              <Link to="/signup" className="font-bold text-brand-purple hover:text-brand-accent transition-colors underline underline-offset-4">
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=1920"
            alt="Social Media Growth"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/90 to-brand-purple/80 mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-20 text-white text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 max-w-lg"
          >
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-white/20">
              <FontAwesomeIcon icon={faRocket} className="text-4xl" />
            </div>
            <h2 className="text-5xl font-display font-bold leading-tight tracking-tighter">Dominate Your Social Media</h2>
            <p className="text-lg text-white/70 font-medium leading-relaxed">
              Join thousands of influencers and businesses who use EasyBoost to scale their reach and engagement across all platforms.
            </p>
            
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-xl font-bold">50K+</div>
                <div className="text-[8px] uppercase font-bold tracking-widest opacity-50">Users</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-xl font-bold">1M+</div>
                <div className="text-[8px] uppercase font-bold tracking-widest opacity-50">Orders</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-xl font-bold">24/7</div>
                <div className="text-[8px] uppercase font-bold tracking-widest opacity-50">Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
