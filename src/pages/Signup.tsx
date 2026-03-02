import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faRocket, faArrowRight, faUser, faBolt, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { motion } from 'motion/react';

interface SignupProps {
  setIsLoggedIn: (val: boolean) => void;
}

export default function Signup({ setIsLoggedIn }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsLoading(true);
    // Mock signup
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({ email }));
      setIsLoggedIn(true);
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
    // Google signup logic will be added later
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
            
            <h2 className="text-5xl font-display font-black text-brand-dark tracking-tighter mb-2">Sign Up</h2>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Create your account</p>
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

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-brand-orange transition-colors">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-200 rounded-2xl text-brand-dark placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all font-bold"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-brand-orange focus:ring-brand-orange border-gray-200 rounded cursor-pointer"
                />
              </div>
              <div className="ml-3 text-xs">
                <label htmlFor="terms" className="text-gray-400 font-bold uppercase tracking-widest">
                  I agree to the{' '}
                  <a href="#" className="text-brand-orange hover:text-brand-coral transition-colors">
                    Terms
                  </a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-5 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white gradient-brand shadow-2xl shadow-brand-orange/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Sign Up'}
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
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-5 px-4 border border-gray-100 rounded-2xl text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faGoogle} className="mr-3 text-lg text-brand-orange" />
              Google
            </button>
          </form>

          <div className="text-center lg:text-left pt-4">
            <p className="text-gray-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-orange hover:text-brand-coral transition-colors underline underline-offset-4">
                Log in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1920"
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
            <h2 className="text-5xl font-display font-bold leading-tight">Start Your Journey to Social Success</h2>
            <p className="text-xl text-white/80 font-medium leading-relaxed">
              Create an account in seconds and get access to the world's most powerful social media boosting tools.
            </p>
            
            <div className="flex flex-col gap-4 pt-8">
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faBolt} className="text-brand-orange" />
                </div>
                <div className="text-left">
                  <div className="font-bold">Instant Delivery</div>
                  <div className="text-xs opacity-70">Get results in minutes</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-brand-orange" />
                </div>
                <div className="text-left">
                  <div className="font-bold">100% Secure</div>
                  <div className="text-xs opacity-70">Your data is always safe</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
