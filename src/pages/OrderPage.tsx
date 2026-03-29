import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingCart, faCheckCircle, faInfoCircle, faRocket, faShieldAlt, faGlobe, faBolt } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, push, set, runTransaction } from 'firebase/database';
import { fetchServices, Service } from '../lib/servicesStore';
import { platformColors } from '../utils/platformData';
import { smmService } from '../services/smmService';
import { PlatformIcon } from '../components/PlatformIcon';

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

  useEffect(() => {
    const loadService = async () => {
      if (!serviceId) {
        navigate('/services');
        return;
      }
      try {
        const services = await fetchServices();
        const found = services.find(s => 
          String(s.apiServiceId) === String(serviceId) || 
          String(s.service) === String(serviceId)
        );
        
        if (found) {
          setService(found);
          setQuantity(found.min || 100);
        } else {
          toast.error('Service not found');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load service');
      } finally {
        setIsLoading(false);
      }
    };
    loadService();
  }, [serviceId, navigate]);

  const totalPrice = service ? Math.round((service.price * quantity) / 1000) : 0;
  const hasInsufficientBalance = userData && userData.balance < totalPrice;

  const [showInstructions, setShowInstructions] = useState(true);

  const defaultInstructions = `
📌 ORDER INSTRUCTIONS:
1. Use the correct link format for the platform.
2. Ensure your account/post is PUBLIC before ordering.
3. Do NOT change your username or delete the post during the order.
4. No refunds for wrong links or private accounts.
  `.trim();

  const handlePlaceOrder = async () => {
    if (!user || !userData) {
      toast.error('Please login to place an order');
      return;
    }
    if (!service) {
      toast.error('Service not found');
      return;
    }
    if (!link) {
      toast.error('Please provide a target link');
      return;
    }

    // WhatsApp Link Validation
    if (service.category.toLowerCase() === 'whatsapp') {
      const isWhatsAppLink = link.includes('chat.whatsapp.com') || link.includes('whatsapp.com/channel');
      if (!isWhatsAppLink) {
        toast.error('Please provide a valid WhatsApp Channel or Group link');
        return;
      }
    }

    if (quantity < (service.min || 100)) {
      toast.error(`Minimum quantity is ${service.min || 100}`);
      return;
    }
    if (quantity > (service.max || 1000000)) {
      toast.error(`Maximum quantity is ${service.max || 1000000}`);
      return;
    }
    
    if (hasInsufficientBalance) {
      toast.error('Insufficient balance. Please top up to continue.');
      return;
    }

    if (totalPrice < 1000) {
      toast.error('Minimum order amount is UGX 1,000');
      return;
    }

    setIsOrdering(true);
    const loadingToast = toast.loading('Processing your order...');

    try {
      // 1. Deduct balance first
      await runTransaction(ref(db, `users/${user.uid}`), (currentData) => {
        if (currentData) {
          if (currentData.balance < totalPrice) throw new Error('Insufficient balance');
          currentData.balance -= totalPrice;
        }
        return currentData;
      });

      // 2. Place order with provider
      let apiData;
      try {
        apiData = await smmService.placeOrder(service.service, link, quantity);
        if (apiData.error) {
          throw new Error(apiData.error);
        }
        if (!apiData.order) {
          throw new Error('Order failed. Provider response: ' + JSON.stringify(apiData));
        }
      } catch (apiErr: any) {
        // 3. Refund immediately if provider fails
        await runTransaction(ref(db, `users/${user.uid}`), (currentData) => {
          if (currentData) {
            currentData.balance += totalPrice;
          }
          return currentData;
        });

        let errorMessage = apiErr.message || 'Server is busy. Please try again later.';
        if (errorMessage.toLowerCase().includes('not enough balance') || 
            errorMessage.toLowerCase().includes('insufficient funds') ||
            errorMessage.toLowerCase().includes('charge more')) {
          errorMessage = "Server processing, please try again later";
        }
        throw new Error(errorMessage);
      }

      // 4. Save order to database
      const provider_cost = (service.rate * 3800 * quantity) / 1000;
      const selling_price = totalPrice;
      const profit = selling_price - provider_cost;

      // Save to recently used (Task 7)
      const recentlyUsed = JSON.parse(localStorage.getItem('easyboost_recently_used') || '[]');
      const updatedRecentlyUsed = [service, ...recentlyUsed.filter((s: any) => s.service !== service.service)].slice(0, 5);
      localStorage.setItem('easyboost_recently_used', JSON.stringify(updatedRecentlyUsed));

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
        selling_price,
        provider_cost,
        profit,
        status: 'Processing',
        createdAt: new Date().toISOString(),
      });

      toast.success('Order placed successfully!', { id: loadingToast });
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err: any) {
      let userMessage = 'Failed to place order. Please try again.';
      const errMsg = err.message?.toLowerCase() || '';
      
      if (errMsg.includes('balance')) userMessage = '⚠️ Insufficient balance. Please top up your wallet.';
      else if (errMsg.includes('quantity')) userMessage = '⚠️ Invalid quantity. Check min/max limits.';
      else if (errMsg.includes('link')) userMessage = '⚠️ Invalid link format. Please check the URL.';
      else if (errMsg.includes('timeout') || errMsg.includes('abort')) userMessage = '⚠️ Connection timed out. Please try again.';
      else if (errMsg.includes('network')) userMessage = '⚠️ Network error. Check your internet connection.';
      
      toast.error(userMessage, { id: loadingToast });
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
                <PlatformIcon platform={service.category} imgClassName="w-10 h-10 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em]">{service.category} Service</div>
                  {service.guaranteed && (
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-black rounded uppercase tracking-widest border border-emerald-200 flex items-center gap-1">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-[7px]" />
                      Guaranteed
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-display font-black text-gray-900 tracking-tighter leading-tight">
                  {service.name}
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-8">
            {/* Service Instructions */}
            <div className="bg-brand-purple/5 rounded-2xl border border-brand-purple/10 overflow-hidden">
              <button 
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full p-4 flex items-center justify-between text-brand-purple hover:bg-brand-purple/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-xs" />
                  <span className="text-[10px] font-black uppercase tracking-widest">📌 Order Instructions</span>
                </div>
                <FontAwesomeIcon 
                  icon={faArrowLeft} 
                  className={`text-[10px] transition-transform duration-300 ${showInstructions ? 'rotate-90' : '-rotate-90'}`} 
                />
              </button>
              <AnimatePresence>
                {showInstructions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <div className="text-[11px] font-medium text-gray-600 leading-relaxed whitespace-pre-wrap border-t border-brand-purple/10 pt-3">
                      {service.description || defaultInstructions}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                  {totalPrice < 1000 && (
                    <div className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mt-1">
                      Min order: UGX 1,000
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Wallet Balance</div>
                  <div className="text-sm font-black text-emerald-400">UGX {userData?.balance?.toLocaleString() || 0}</div>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isOrdering}
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
