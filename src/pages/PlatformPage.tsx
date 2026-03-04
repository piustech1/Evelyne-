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
  }, [platform, location.state]);

  const totalPrice = selectedService ? Math.round((selectedService.price * quantity) / 1000) : 0;
  const hasInsufficientBalance = userData && userData.balance < totalPrice;

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
    
    // If insufficient balance, we don't block the button but we show error on final step
    if (hasInsufficientBalance) {
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

  if (isLoading) return <div className="pt-32 text-center text-brand-light font-black uppercase tracking-widest">Loading Platform...</div>;
  if (!category && !isLoading) return <div className="pt-32 text-center text-brand-light font-black uppercase tracking-widest">Platform not found</div>;

  const icon = platformIcons[platform?.toLowerCase() || ''] || faRocket;
  const colorClass = platformColors[platform?.toLowerCase() || ''] || 'bg-brand-purple text-white';

  return (
    <div className="pt-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 ${colorClass} rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/10`}>
            <FontAwesomeIcon icon={icon} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-brand-light tracking-tighter">{category?.name || platform} Services</h1>
            <p className="text-gray-400 font-medium text-sm">Boost your presence instantly</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/services')}
          className="flex items-center px-4 py-2 rounded-xl bg-white border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand-purple hover:border-brand-purple transition-all shadow-sm group self-start md:self-auto"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Services
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Services List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Available Services</h2>
            <span className="text-[9px] font-black text-brand-purple bg-brand-purple/5 px-2 py-1 rounded-full uppercase tracking-widest">{services.length} Options</span>
          </div>
          
          <div className="space-y-3">
            {services.length > 0 ? (
              services.map((service: any) => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => {
                    setSelectedService(service);
                    setOrderError('');
                    setOrderSuccess(false);
                  }}
                  className={`p-4 md:p-5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                    selectedService?.id === service.id 
                    ? 'border-brand-purple bg-brand-purple/5 shadow-sm' 
                    : 'border-gray-200 bg-gray-50 hover:border-brand-purple/20 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                      selectedService?.id === service.id 
                      ? 'bg-brand-purple text-white border-brand-purple shadow-sm' 
                      : 'bg-white text-gray-300 border-gray-200 group-hover:bg-brand-purple/10 group-hover:text-brand-purple group-hover:border-brand-purple/20'
                    }`}>
                      <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-brand-light group-hover:text-brand-purple transition-colors tracking-tight">{service.name}</h3>
                      <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{service.description || 'High quality service'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-brand-purple">UGX {service.price?.toLocaleString()}</div>
                    <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Per 1k</div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-gray-50 p-12 rounded-3xl border border-gray-200 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-200 mx-auto border border-gray-100">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No services available for this platform yet.</p>
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
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-gray-50 p-10 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[350px] shadow-sm"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-200 text-3xl border border-gray-100">
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-brand-light tracking-tighter">Select a Service</h3>
                    <p className="text-gray-400 font-medium max-w-[200px] mx-auto text-xs leading-relaxed">Pick a service from the left to configure your boost order.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-6 md:p-8 rounded-3xl shadow-md border border-gray-200 space-y-6"
                >
                  <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-sm">
                      <FontAwesomeIcon icon={faShoppingCart} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-brand-light tracking-tighter text-gray-900">Configure Order</h2>
                      <p className="text-[9px] text-brand-purple font-black uppercase tracking-widest mt-0.5">{selectedService.name}</p>
                    </div>
                  </div>

                  {orderError && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-[10px] font-bold text-center space-y-3">
                      <div>{orderError}</div>
                      {hasInsufficientBalance && (
                        <button 
                          onClick={() => navigate('/wallet')}
                          className="w-full py-2 bg-rose-500 text-white rounded-lg text-[9px] uppercase tracking-widest hover:bg-rose-600 transition-colors"
                        >
                          Top Up Now
                        </button>
                      )}
                    </div>
                  )}

                  {orderSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-500 text-[10px] font-bold text-center flex items-center justify-center space-x-2">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>Order placed successfully! Redirecting...</span>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 ml-1 uppercase tracking-[0.2em]">Target Link / URL</label>
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://platform.com/username"
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/5 focus:border-brand-purple transition-all text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 ml-1 uppercase tracking-[0.2em]">Order Quantity</label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        placeholder={`Min: ${selectedService.min || 100}`}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/5 focus:border-brand-purple transition-all text-xl font-display font-black"
                      />
                      <div className="flex justify-between px-1">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Min: {selectedService.min || 100}</span>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Max: {selectedService.max > 1000000 ? '1M+' : selectedService.max?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex justify-between items-center shadow-inner">
                      <div>
                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Price</div>
                        <div className="text-2xl font-display font-black text-brand-purple tracking-tighter">UGX {totalPrice.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Rate</div>
                        <div className="text-[10px] font-black text-gray-900">UGX {selectedService.price}/1k</div>
                      </div>
                    </div>

                    <button 
                      onClick={handlePlaceOrder}
                      disabled={isOrdering || orderSuccess}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all text-[10px] flex items-center justify-center space-x-2 group disabled:opacity-50"
                    >
                      <span>{isOrdering ? 'Processing...' : 'Place Order Now'}</span>
                      {!isOrdering && <FontAwesomeIcon icon={faRocket} className="text-[8px] group-hover:translate-x-0.5 transition-transform" />}
                    </button>
                    
                    <p className="text-center text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">
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
