import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faYoutube, faFacebook, faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faShoppingCart, faCheckCircle, faInfoCircle, faRocket, faSearch, faThLarge, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, push, set, runTransaction } from 'firebase/database';
import { fetchServices, Service, PLATFORMS } from '../lib/servicesStore';

const platformIcons: Record<string, any> = {
  tiktok: faTiktok,
  instagram: faInstagram,
  youtube: faYoutube,
  facebook: faFacebook,
  telegram: faTelegram,
  twitter: faTwitter,
  others: faGlobe
};

const platformColors: Record<string, string> = {
  tiktok: 'bg-black text-white',
  instagram: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
  youtube: 'bg-[#FF0000] text-white',
  facebook: 'bg-[#1877F2] text-white',
  telegram: 'bg-[#0088cc] text-white',
  twitter: 'bg-[#1DA1F2] text-white',
  others: 'bg-gray-500 text-white'
};

export default function Boost() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchServices();
        setAllServices(data);
        
        const serviceId = searchParams.get('service');
        if (serviceId) {
          const service = data.find(s => s.apiServiceId === serviceId || s.service === serviceId);
          if (service) {
            setSelectedPlatform(service.category);
            setSelectedService(service);
            setQuantity(service.min || 100);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [searchParams]);

  const filteredServices = useMemo(() => {
    if (!selectedPlatform) return [];
    return allServices.filter(s => 
      s.category === selectedPlatform && 
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.apiServiceId.toString().includes(searchTerm))
    );
  }, [allServices, selectedPlatform, searchTerm]);

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
    
    if (hasInsufficientBalance) {
      setOrderError('Insufficient balance. Please top up to continue.');
      return;
    }

    setIsOrdering(true);
    setOrderError('');

    try {
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
      if (apiData.error) throw new Error(apiData.error);
      if (!apiData.order) throw new Error('Failed to place order with provider');

      const userRef = ref(db, `users/${user.uid}`);
      await runTransaction(userRef, (currentData) => {
        if (currentData) {
          if (currentData.balance < totalPrice) throw new Error('Insufficient balance');
          currentData.balance -= totalPrice;
        }
        return currentData;
      });

      const originalCost = (selectedService.rate * quantity) / 1000;
      const profit = totalPrice - originalCost;

      const ordersRef = ref(db, 'orders');
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, {
        userId: user.uid,
        userName: userData.name,
        userEmail: user.email,
        serviceId: selectedService.service,
        apiServiceId: selectedService.service,
        apiOrderId: apiData.order,
        service: selectedService.name,
        platform: selectedService.category,
        link,
        quantity,
        price: totalPrice,
        originalCost,
        profit,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      });

      setOrderSuccess(true);
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order');
    } finally {
      setIsOrdering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Services...</p>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black text-gray-900 tracking-tighter flex items-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-3 border border-blue-100 shadow-sm">
            <FontAwesomeIcon icon={faRocket} className="text-blue-600 text-sm" />
          </div>
          Boost Now
        </h1>
        <button 
          onClick={() => navigate(-1)}
          className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 hover:text-brand-purple transition-all"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Platform & Service Selection */}
        <div className="lg:col-span-7 space-y-8">
          {/* Platform Selector */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">1. Select Platform</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPlatform(p);
                    setSelectedService(null);
                  }}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-2 group ${
                    selectedPlatform === p 
                    ? 'border-brand-purple bg-brand-purple/5 shadow-sm' 
                    : 'border-gray-200 bg-gray-50 hover:border-brand-purple/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-transform group-hover:scale-110 ${
                    selectedPlatform === p ? platformColors[p.toLowerCase()] || 'bg-brand-purple text-white' : 'bg-white text-gray-300 border border-gray-100'
                  }`}>
                    <FontAwesomeIcon icon={platformIcons[p.toLowerCase()] || faGlobe} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedPlatform === p ? 'text-brand-purple' : 'text-gray-400'}`}>
                    {p}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Service Selector */}
          <AnimatePresence mode="wait">
            {selectedPlatform && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">2. Select Service</h2>
                  <div className="relative w-48">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-[10px]" />
                    <input 
                      type="text" 
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <motion.div
                        key={service.apiServiceId}
                        onClick={() => {
                          setSelectedService(service);
                          setQuantity(service.min || 100);
                          setOrderError('');
                        }}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                          selectedService?.apiServiceId === service.apiServiceId 
                          ? 'border-brand-purple bg-brand-purple/5 shadow-sm' 
                          : 'border-gray-200 bg-gray-50 hover:border-brand-purple/20'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                            selectedService?.apiServiceId === service.apiServiceId 
                            ? 'bg-brand-purple text-white border-brand-purple shadow-sm' 
                            : 'bg-white text-gray-300 border-gray-100 group-hover:border-brand-purple/20'
                          }`}>
                            <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                          </div>
                          <div>
                            <h3 className="text-xs font-black text-gray-900 group-hover:text-brand-purple transition-colors">{service.name}</h3>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Min: {service.min}</span>
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Max: {service.max > 1000000 ? '1M+' : service.max}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-brand-purple">UGX {service.price.toLocaleString()}</div>
                          <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest">/ 1k</div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <FontAwesomeIcon icon={faInfoCircle} className="text-gray-300 mb-2" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No services found for this platform</p>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Order Form */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <AnimatePresence mode="wait">
              {!selectedService ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-gray-50 p-10 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[400px]"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-200 text-3xl border border-gray-100 shadow-sm">
                    <FontAwesomeIcon icon={faThLarge} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-gray-900 tracking-tighter">Ready to Boost?</h3>
                    <p className="text-gray-400 font-medium max-w-[200px] mx-auto text-[10px] leading-relaxed uppercase tracking-widest">Select a platform and service to begin your order.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-200 space-y-6"
                >
                  <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-sm ${platformColors[selectedPlatform?.toLowerCase() || 'others']}`}>
                      <FontAwesomeIcon icon={platformIcons[selectedPlatform?.toLowerCase() || 'others']} />
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-xl font-black text-gray-900 tracking-tighter">Configure Order</h2>
                      <p className="text-[9px] text-brand-purple font-black uppercase tracking-widest mt-0.5 line-clamp-1">{selectedService.name}</p>
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
                      <span>Order placed successfully!</span>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 ml-1 uppercase tracking-widest">Target Link / URL</label>
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://social.com/p/abc123"
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/5 focus:border-brand-purple transition-all text-xs font-bold shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 ml-1 uppercase tracking-widest">Order Quantity</label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-purple/5 focus:border-brand-purple transition-all text-2xl font-display font-black shadow-sm"
                      />
                      <div className="flex justify-between px-1">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Min: {selectedService.min}</span>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Max: {selectedService.max > 1000000 ? '1M+' : selectedService.max}</span>
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
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-[10px] flex items-center justify-center space-x-2 group disabled:opacity-50"
                    >
                      <span>{isOrdering ? 'Boosting...' : 'Boost Now'}</span>
                      {!isOrdering && <FontAwesomeIcon icon={faRocket} className="text-[8px] group-hover:translate-x-0.5 transition-transform" />}
                    </button>
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
