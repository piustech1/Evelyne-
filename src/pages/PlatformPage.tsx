import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faYoutube, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faShoppingCart, faCheckCircle, faInfoCircle, faRocket } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, onValue, push, set, runTransaction } from 'firebase/database';

const platformIcons: Record<string, any> = {
  tiktok: faTiktok,
  instagram: faInstagram,
  youtube: faYoutube,
  facebook: faFacebook,
};

const platformColors: Record<string, string> = {
  tiktok: 'text-white bg-white/10',
  instagram: 'text-white bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
  youtube: 'text-white bg-[#FF0000]',
  facebook: 'text-white bg-[#1877F2]',
};

export default function PlatformPage() {
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData } = useAuth();
  
  const [category, setCategory] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (platform) {
      const categoryRef = ref(db, `categories/${platform}`);
      onValue(categoryRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCategory({ id: platform, ...data });
        }
      });

      const servicesRef = ref(db, 'services');
      onValue(servicesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const servicesArray = Object.entries(data)
            .map(([id, value]: [string, any]) => ({ id, ...value }))
            .filter((s: any) => s.categoryId === platform);
          setServices(servicesArray);

          // Handle pre-selected service from navigation state
          if (location.state?.preSelectedService) {
            const preSelected = servicesArray.find(s => s.apiServiceId === location.state.preSelectedService.apiServiceId);
            if (preSelected) {
              setSelectedService(preSelected);
            }
          }
        }
        setIsLoading(false);
      });
    }
  }, [platform]);

  const totalPrice = selectedService ? Math.round((selectedService.price * quantity) / 1000) : 0;

  const handlePlaceOrder = async () => {
    if (!user || !userData) {
      setOrderError('Please login to place an order');
      return;
    }
    if (!selectedService) {
      setOrderError('Please select a service');
      return;
    }
    if (!link) {
      setOrderError('Please provide a target link');
      return;
    }
    if (quantity < (selectedService.min || 100)) {
      setOrderError(`Minimum quantity is ${selectedService.min || 100}`);
      return;
    }
    if (userData.balance < totalPrice) {
      setOrderError('Insufficient balance. Please top up your wallet.');
      return;
    }

    setIsOrdering(true);
    setOrderError('');

    try {
      // 1. Call SMM API Proxy
      const apiResponse = await fetch('/api/smm/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedService.service,
          link,
          quantity
        })
      });

      const apiData = await apiResponse.json();

      if (apiData.error) {
        throw new Error(apiData.error);
      }

      if (!apiData.order) {
        throw new Error('Failed to place order with provider');
      }

      // 2. Use transaction to safely deduct balance
      const userRef = ref(db, `users/${user.uid}`);
      await runTransaction(userRef, (currentData) => {
        if (currentData) {
          if (currentData.balance < totalPrice) {
            throw new Error('Insufficient balance');
          }
          currentData.balance -= totalPrice;
        }
        return currentData;
      });

      // 3. Calculate Profit
      const originalCost = (selectedService.rate * quantity) / 1000;
      const profit = totalPrice - originalCost;

      // 4. Create order in Firebase
      const ordersRef = ref(db, 'orders');
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, {
        userId: user.uid,
        userName: userData.name,
        userEmail: user.email,
        serviceId: selectedService.id,
        apiServiceId: selectedService.service,
        apiOrderId: apiData.order,
        service: selectedService.name,
        platform: category?.name || platform,
        link,
        quantity,
        price: totalPrice,
        originalCost,
        profit,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      });

      setOrderSuccess(true);
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order');
    } finally {
      setIsOrdering(false);
    }
  };

  if (isLoading) return <div className="pt-32 text-center text-white font-black uppercase tracking-widest">Loading Platform...</div>;
  if (!category && !isLoading) return <div className="pt-32 text-center text-white font-black uppercase tracking-widest">Platform not found</div>;

  const icon = platformIcons[platform?.toLowerCase() || ''] || faRocket;
  const colorClass = platformColors[platform?.toLowerCase() || ''] || 'bg-brand-purple text-white';

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center space-x-6">
          <div className={`w-20 h-20 ${colorClass} rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl shadow-black/20 transform hover:rotate-6 transition-transform border border-white/10`}>
            <FontAwesomeIcon icon={icon} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter">{category?.name || platform} Services</h1>
            <p className="text-gray-500 font-medium text-lg">Select a service to boost your presence</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white hover:border-brand-purple transition-all shadow-xl group self-start md:self-auto"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Services List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Available Services</h2>
            <span className="text-[10px] font-black text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-full uppercase tracking-widest">{services.length} Options</span>
          </div>
          
          <div className="space-y-4">
            {services.length > 0 ? (
              services.map((service: any) => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setSelectedService(service);
                    setOrderError('');
                    setOrderSuccess(false);
                  }}
                  className={`p-6 md:p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all flex items-center justify-between group ${
                    selectedService?.id === service.id 
                    ? 'border-brand-purple bg-brand-purple/5 shadow-2xl shadow-brand-purple/10' 
                    : 'border-white/5 bg-brand-card hover:border-brand-purple/20 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${
                      selectedService?.id === service.id 
                      ? 'bg-brand-purple text-white border-brand-purple shadow-lg' 
                      : 'bg-white/5 text-gray-700 border-white/5 group-hover:bg-brand-purple/10 group-hover:text-brand-purple group-hover:border-brand-purple/20'
                    }`}>
                      <FontAwesomeIcon icon={faCheckCircle} className={selectedService?.id === service.id ? 'opacity-100' : 'opacity-40'} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-brand-purple transition-colors tracking-tight">{service.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{service.description || 'High quality service'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-brand-purple">UGX {service.price?.toLocaleString()}</div>
                    <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Per 1,000</div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-brand-card p-12 rounded-[2.5rem] border border-white/5 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-700 mx-auto">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-2xl" />
                </div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No services available for this platform yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Form */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-24">
            <AnimatePresence mode="wait">
              {!selectedService ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-brand-card p-12 rounded-[3.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-8 h-full min-h-[450px] shadow-2xl"
                >
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-brand-purple/20 text-5xl shadow-inner">
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-white tracking-tighter">Select a Service</h3>
                    <p className="text-gray-500 font-medium max-w-[240px] mx-auto text-sm leading-relaxed">Pick a service from the left to configure your boost order and see pricing.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-brand-card p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5 space-y-10"
                >
                  <div className="flex items-center space-x-5 pb-8 border-b border-white/5">
                    <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-brand-blue/20 border border-white/10">
                      <FontAwesomeIcon icon={faShoppingCart} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tighter">Configure Order</h2>
                      <p className="text-xs text-brand-purple font-black uppercase tracking-widest mt-1">{selectedService.name}</p>
                    </div>
                  </div>

                  {orderError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold text-center">
                      {orderError}
                    </div>
                  )}

                  {orderSuccess && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-xs font-bold text-center flex items-center justify-center space-x-2">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>Order placed successfully! Redirecting...</span>
                    </div>
                  )}

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-[0.2em]">Target Link / URL</label>
                      <div className="relative group">
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder="https://platform.com/username"
                          className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-[0.2em]">Order Quantity</label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          placeholder={`Min: ${selectedService.min || 100}`}
                          className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all text-2xl font-display font-black"
                        />
                      </div>
                      <div className="flex justify-between px-2">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Min: {selectedService.min || 100}</span>
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Max: {selectedService.max || '1M'}</span>
                      </div>
                    </div>

                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 flex justify-between items-center shadow-inner relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                      <div className="relative z-10">
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Amount</div>
                        <div className="text-3xl font-display font-black text-brand-purple tracking-tighter">UGX {totalPrice.toLocaleString()}</div>
                      </div>
                      <div className="text-right relative z-10">
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Rate</div>
                        <div className="text-sm font-black text-white">UGX {selectedService.price}/1k</div>
                      </div>
                    </div>

                    <button 
                      onClick={handlePlaceOrder}
                      disabled={isOrdering || orderSuccess}
                      className="w-full py-5 gradient-brand text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm flex items-center justify-center space-x-3 group disabled:opacity-50"
                    >
                      <span>{isOrdering ? 'Processing...' : 'Place Order Now'}</span>
                      {!isOrdering && <FontAwesomeIcon icon={faShoppingCart} className="text-xs group-hover:translate-x-1 transition-transform" />}
                    </button>
                    
                    <p className="text-center text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">
                      Secure checkout powered by EasyBoost
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
