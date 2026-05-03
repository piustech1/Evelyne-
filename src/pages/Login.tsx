import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faRocket, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast.error('Authentication service is currently unavailable. Please try again later.');
      return;
    }
    setIsLoading(true);
    const loadingToast = toast.loading('Signing in...');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!', { id: loadingToast });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to login', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      toast.error('Authentication service is currently unavailable. Please try again later.');
      return;
    }
    setIsLoading(true);
    const loadingToast = toast.loading('Connecting to Google...');
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Welcome back!', { id: loadingToast });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to login with Google', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f5f5f5]">
      {/* Left Side: Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-6 md:p-8 bg-white rounded-lg border border-gray-200 shadow-xl"
        >
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center space-x-3 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faRocket} className="text-white text-lg" />
              </div>
              <span className="text-xl font-display font-black text-gray-900 tracking-tighter">Super Boost</span>
            </Link>
            
            <h2 className="text-2xl font-display font-black text-gray-900 tracking-tighter mb-1">Welcome Back</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Login to your account</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-[#f5f5f5] border border-[#ddd] rounded-lg text-[#111] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-[#f5f5f5] border border-[#ddd] rounded-lg text-[#111] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-sm"
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
                  className="h-4 w-4 bg-gray-50 border-gray-200 text-blue-600 focus:ring-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-500 font-bold uppercase tracking-widest cursor-pointer">
                  Remember me
                </label>
              </div>
              <a href="#" className="font-black text-blue-600 hover:text-purple-600 transition-colors uppercase tracking-widest">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-xs font-black uppercase tracking-widest rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active-press transition-all disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              {!isLoading && <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest">
                <span className="px-4 bg-white text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-lg text-gray-600 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 active-press"
            >
              <FontAwesomeIcon icon={faGoogle} className="mr-3 text-base text-blue-600" />
              Google Account
            </button>
          </form>

          <div className="text-center pt-6">
            <p className="text-gray-500 text-xs font-medium">
              New to Super Boost?{' '}
              <Link to="/signup" className="font-bold text-blue-600 hover:text-purple-600 transition-colors underline underline-offset-4">
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
            src="https://imgur.com/XC4qOBl.png"
            alt="Social Media Growth"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/90 to-purple-600/80 mix-blend-multiply" />
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
              Join thousands of influencers and businesses who use Super Boost to scale their reach and engagement across all platforms.
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
