import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faRocket, faArrowRight, faUser, faBolt, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { auth, db, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { ref, set, get, push, query, orderByChild, equalTo, runTransaction } from 'firebase/database';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam);
    }
  }, [searchParams]);

  const generateReferralCode = (name: string) => {
    const prefix = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'USER');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    const loadingToast = toast.loading('Creating your account...');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      const newReferralCode = generateReferralCode(name);
      let referredBy = null;

      // Check if referral code is valid
      if (referralCode.trim()) {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        const allUsers = snapshot.val();
        
        if (allUsers) {
          const referrerId = Object.keys(allUsers).find(uid => allUsers[uid].referralCode === referralCode.trim());
          if (referrerId) {
            referredBy = referralCode.trim();
            
            // Update referrer's count
            const referrerRef = ref(db, `users/${referrerId}`);
            const currentCount = allUsers[referrerId].referralCount || 0;
            await set(referrerRef, {
              ...allUsers[referrerId],
              referralCount: currentCount + 1
            });

            // Add notification for referrer
            const notificationRef = push(ref(db, `notifications/${referrerId}`));
            await set(notificationRef, {
              message: `Your referral ${name} is active! You will receive your 1K followers soon. Keep referring!`,
              type: 'referral',
              timestamp: new Date().toISOString(),
              read: false
            });
          } else {
            toast.error('Invalid referral code. Proceeding without it.');
          }
        }
      }

      // Save user data to database
      await set(ref(db, `users/${user.uid}`), {
        name,
        email,
        balance: 0,
        referralCode: newReferralCode,
        referredBy,
        referralCount: 0,
        createdAt: new Date().toISOString(),
      });
      
      toast.success('Account created successfully!', { id: loadingToast });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading('Connecting to Google...');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Save user data to database if it doesn't exist
      const newReferralCode = generateReferralCode(user.displayName || 'User');
      await set(ref(db, `users/${user.uid}`), {
        name: user.displayName || 'User',
        email: user.email,
        balance: 0,
        referralCode: newReferralCode,
        referralCount: 0,
        createdAt: new Date().toISOString(),
      });
      
      toast.success('Account created successfully!', { id: loadingToast });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to signup with Google', { id: loadingToast });
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
          className="max-w-xl w-full p-6 md:p-8 bg-white rounded-lg border border-gray-200 shadow-xl"
        >
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center space-x-3 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faRocket} className="text-white text-lg" />
              </div>
              <span className="text-xl font-display font-black text-gray-900 tracking-tighter">EasyBoost</span>
            </Link>
            
            <h2 className="text-2xl font-display font-black text-gray-900 tracking-tighter mb-1">Join Us</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Create your free account</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-[#f5f5f5] border border-[#ddd] rounded-lg text-[#111] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Confirm</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <FontAwesomeIcon icon={faLock} />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-[#f5f5f5] border border-[#ddd] rounded-lg text-[#111] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Referral Code (Optional)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <FontAwesomeIcon icon={faBolt} />
                  </div>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-[#f5f5f5] border border-[#ddd] rounded-lg text-[#111] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-sm"
                    placeholder="PIUS3482"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 bg-gray-50 border-gray-200 text-blue-600 focus:ring-blue-600 rounded cursor-pointer"
                />
              </div>
              <div className="ml-3 text-[10px]">
                <label htmlFor="terms" className="text-gray-500 font-bold uppercase tracking-widest">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-purple-600 transition-colors">
                    Terms & Conditions
                  </a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-xs font-black uppercase tracking-widest rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active-press transition-all disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
              {!isLoading && <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest">
                <span className="px-4 bg-white text-gray-400">Or join with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-lg text-gray-600 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 active-press"
            >
              <FontAwesomeIcon icon={faGoogle} className="mr-3 text-base text-blue-600" />
              Google Account
            </button>
          </form>

          <div className="text-center pt-6">
            <p className="text-gray-500 text-xs font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-purple-600 transition-colors underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://cdn.fexpink.com/smmgen/images/v3/cheapest-smm-panel.webp"
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
            <h2 className="text-5xl font-display font-bold leading-tight tracking-tighter">Start Your Success Journey</h2>
            <p className="text-lg text-white/70 font-medium leading-relaxed">
              Create an account in seconds and get access to the world's most powerful social media boosting tools.
            </p>
            
            <div className="flex flex-col gap-4 pt-8">
              <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faBolt} className="text-brand-purple" />
                </div>
                <div className="text-left">
                  <div className="font-bold">Instant Delivery</div>
                  <div className="text-[10px] opacity-50">Get results in minutes</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-brand-purple" />
                </div>
                <div className="text-left">
                  <div className="font-bold">100% Secure</div>
                  <div className="text-[10px] opacity-50">Your data is always safe</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
