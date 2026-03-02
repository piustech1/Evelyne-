import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faRocket, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { motion } from 'motion/react';

interface LoginProps {
  setIsLoggedIn: (val: boolean) => void;
}

export default function Login({ setIsLoggedIn }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({ email }));
      setIsLoggedIn(true);
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Google login logic will be added later
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-24 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full space-y-10"
        >
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-flex items-center space-x-2 mb-12 group">
              <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand-orange/20 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faRocket} className="text-white text-xl" />
              </div>
              <span className="text-2xl font-display font-black text-brand-dark tracking-tighter">EasyBoost</span>
            </Link>
            
            <h2 className="text-5xl font-display font-black text-brand-dark tracking-tighter mb-2">Login</h2>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Access your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-brand-orange transition-colors">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-brand-dark placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all font-bold"
                    placeholder="Email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-brand-orange transition-colors">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-200 rounded-2xl text-brand-dark placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all font-bold"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-orange focus:ring-brand-orange border-gray-200 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-400 font-bold uppercase tracking-widest cursor-pointer">
                  Remember me
                </label>
              </div>
              <a href="#" className="font-black text-brand-orange hover:text-brand-coral transition-colors uppercase tracking-widest">
                Forgot?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-5 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white gradient-brand shadow-2xl shadow-brand-orange/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Login'}
              {!isLoading && <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                <span className="px-4 bg-white text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-5 px-4 border border-gray-100 rounded-2xl text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faGoogle} className="mr-3 text-lg text-brand-orange" />
              Google
            </button>
          </form>

          <div className="text-center lg:text-left pt-4">
            <p className="text-gray-500 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-brand-orange hover:text-brand-coral transition-colors underline underline-offset-4">
                Create account for free
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
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/90 to-brand-coral/80 mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-20 text-white text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 max-w-lg"
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-white/20">
              <FontAwesomeIcon icon={faRocket} className="text-5xl" />
            </div>
            <h2 className="text-5xl font-display font-bold leading-tight">Dominate Your Social Media Today</h2>
            <p className="text-xl text-white/80 font-medium leading-relaxed">
              Join thousands of influencers and businesses who use EasyBoost to scale their reach and engagement across all platforms.
            </p>
            
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold">1M+</div>
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Orders</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
