import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingCart, faCheckCircle, faInfoCircle, faRocket, faShieldAlt, faGlobe, faBolt } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, push, set, runTransaction } from 'firebase/database';
import { fetchServices, Service } from '../lib/servicesStore';
import { platformIcons, platformColors } from '../utils/platformData';

export default function OrderPage() {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      if (!serviceId) {
        navigate('/services');
        return;
      }
      try {
        const services = await fetchServices();
        // Try both apiServiceId and service (id)
        const found = services.find(s => 
          String(s.apiServiceId) === String(serviceId) || 
          String(s.service) === String(serviceId)
        );
        
        if (found) {
          setService(found);
          setQuantity(found.min || 100);
        } else {
          setOrderError('Service not found');
        }
      } catch (err) {
        console.error(err);
        setOrderError('Failed to load service');
      } finally {
        setIsLoading(false);
      }
    };
    loadService();
  }, [serviceId, navigate]);

  const totalPrice = service ? Math.round((service.price * quantity) / 1000) : 0;
  const hasInsufficientBalance = userData && userData.balance < totalPrice;

  const handlePlaceOrder = async () => {
    if (!user || !userData) {
      setOrderError('Please login to place an order');
      return;
    }
    if (!service) {
      setOrderError('Service not found');
      return;
    }
    if (!link) {
      setOrderError('Please provide a target link');
      return;
    }
    if (quantity < (service.min || 100)) {
      setOrderError(`Minimum quantity is ${service.min || 100}`);
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
          service: service.service,
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

      const originalCost = (service.rate * quantity) / 1000;
      const profit = totalPrice - originalCost;

      const ordersRef = ref(db, 'orders');
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, {
        userId: user.uid,
        userName: userData.name,
        userEmail: user.email,
        serviceId: service.service,
        apiServiceId: service.service,
        apiOrderId: apiData.order,
        service: service.name,
        platform: service.category,
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin shadow-lg shadow-brand-purple/20" />
        <div className="text-center space-y-2">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Securing Connection...</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fetching service details from provider</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 text-3xl border border-rose-100">
          <FontAwesomeIcon icon={faInfoCircle} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-black text-gray-900 tracking-tighter">Service Not Found</h1>
          <p className="text-gray-500 text-xs max-w-xs mx-auto leading-relaxed">
            The service you're looking for might have been removed or is currently unavailable.
          </p>
        </div>
        <button 
          onClick={() => navigate('/services')} 
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-purple transition-all shadow-lg"
        >
          Browse Other Services
        </button>
      </div>
    );
  }

  const platformKey = service.category.toLowerCase();

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-32">
      {/* Curved Header */}
      <div className="gradient-brand pt-12 pb-24 px-6 text-white text-center rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10 space-y-4"
        >
          <div className="flex items-center justify-center">
            <h1 className="text-2xl md:text-4xl font-display font-black tracking-tighter">Finalize Order</h1>
          </div>
          <p className="text-white/80 max-w-md mx-auto font-medium text-xs uppercase tracking-widest">
            You're just one step away from boosting your presence.
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Service Header */}
          <div className="p-6 md:p-10 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center space-x-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-4 border-white ${platformColors[platformKey] || 'bg-brand-purple text-white'}`}>
                <FontAwesomeIcon icon={platformIcons[platformKey] || faGlobe} />
              </div>
              <div>
                <div className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em] mb-1">{service.category} Service</div>
                <h2 className="text-xl md:text-2xl font-display font-black text-gray-900 tracking-tighter leading-tight">
                  {service.name}
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-8">
            {/* Service Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Price / 1k</div>
                <div className="text-sm font-black text-brand-purple">UGX {service.price.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Minimum</div>
                <div className="text-sm font-black text-gray-900">{service.min.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Maximum</div>
                <div className="text-sm font-black text-gray-900">{service.max > 1000000 ? '1M+' : service.max.toLocaleString()}</div>
              </div>
            </div>

            {/* Order Form */}
            <div className="space-y-6">
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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">Target Link / URL</label>
                <div className="relative">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://social.com/p/abc123"
                    className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all text-sm font-bold shadow-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-xs" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">Order Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all text-3xl font-display font-black shadow-sm"
                />
              </div>

              {/* Price Preview */}
              <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
                <div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Amount</div>
                  <div className="text-3xl font-display font-black text-white tracking-tighter">UGX {totalPrice.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Wallet Balance</div>
                  <div className="text-sm font-black text-emerald-400">UGX {userData?.balance?.toLocaleString() || 0}</div>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isOrdering || orderSuccess}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm flex items-center justify-center space-x-3 group disabled:opacity-50"
              >
                <FontAwesomeIcon icon={isOrdering ? faBolt : faRocket} className={`${isOrdering ? 'animate-spin' : 'group-hover:translate-x-1 transition-transform'}`} />
                <span>{isOrdering ? 'Processing Order...' : 'Confirm & Place Order'}</span>
              </button>

              <div className="flex items-center justify-center space-x-4 pt-4">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-emerald-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="w-1 h-1 bg-gray-200 rounded-full" />
                <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <FontAwesomeIcon icon={faBolt} className="text-amber-500" />
                  <span>Instant Start</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
