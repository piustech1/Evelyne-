import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faCheckCircle, faClock, faTimesCircle, faSpinner, 
  faRocket, faLink, faHashtag, faCalendarAlt, faSyncAlt, 
  faChartLine, faMoneyBillWave, faCoins, faInfoCircle, faSync
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { useAuth } from '../hooks/useAuth';
import { smmService } from '../services/smmService';
import toast from 'react-hot-toast';

const statusStyles: Record<string, any> = {
  'Completed': { bg: 'bg-emerald-500', text: 'text-white', icon: faCheckCircle, label: 'Delivered' },
  'Delivered': { bg: 'bg-emerald-500', text: 'text-white', icon: faCheckCircle, label: 'Delivered' },
  'Processing': { bg: 'bg-blue-500', text: 'text-white', icon: faSpinner, label: 'Processing' },
  'In progress': { bg: 'bg-blue-500', text: 'text-white', icon: faSpinner, label: 'In Progress' },
  'Pending': { bg: 'bg-amber-500', text: 'text-white', icon: faClock, label: 'Pending' },
  'Canceled': { bg: 'bg-rose-500', text: 'text-white', icon: faTimesCircle, label: 'Cancelled' },
  'Cancelled': { bg: 'bg-rose-500', text: 'text-white', icon: faTimesCircle, label: 'Cancelled' },
  'Partial': { bg: 'bg-purple-500', text: 'text-white', icon: faSpinner, label: 'Partial' },
  'Failed': { bg: 'bg-rose-500', text: 'text-white', icon: faTimesCircle, label: 'Failed' },
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!order || !order.apiOrderId) {
      toast.error('No provider ID found for this order');
      return;
    }

    setIsRefreshing(true);
    const loadingToast = toast.loading('Refreshing status...');
    try {
      const statusData = await smmService.getStatus(order.apiOrderId);
      if (statusData.status) {
        await update(ref(db, `orders/${orderId}`), {
          status: statusData.status,
          remains: statusData.remains || 0,
          start_count: statusData.start_count || 0,
          updatedAt: new Date().toISOString()
        });
        toast.success('Status updated!', { id: loadingToast });
      } else {
        throw new Error('Failed to get status from provider');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to refresh status', { id: loadingToast });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      const orderRef = ref(db, `orders/${orderId}`);
      onValue(orderRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setOrder({ id: orderId, ...data });
        }
        setIsLoading(false);
      });
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 text-3xl border border-rose-100">
          <FontAwesomeIcon icon={faInfoCircle} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-black text-gray-900 tracking-tighter">Order Not Found</h1>
          <p className="text-gray-500 text-xs max-w-xs mx-auto">The order you are looking for does not exist or has been removed.</p>
        </div>
        <button onClick={() => navigate('/orders')} className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-purple transition-all">
          Back to Orders
        </button>
      </div>
    );
  }

  const status = statusStyles[order.status] || statusStyles['Pending'];
  const progress = order.quantity > 0 ? Math.min(100, Math.max(0, ((order.quantity - (order.remains || 0)) / order.quantity) * 100)) : 0;
  const deliveredCount = order.quantity - (order.remains || 0);

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-32">
      {/* Curved Header */}
      <div className="gradient-brand pt-12 pb-24 px-6 text-white rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="max-w-4xl mx-auto relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back</span>
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">Order Tracking</span>
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">#{order.id.slice(-8).toUpperCase()}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tighter leading-tight">
                {order.service}
              </h1>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 self-start md:self-center">
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center space-x-2 active-press disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faSync} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest">Refresh Status</span>
              </button>
              <div className={`px-6 py-3 rounded-2xl ${status.bg} ${status.text} shadow-xl flex items-center space-x-3 border border-white/20`}>
                <FontAwesomeIcon icon={status.icon} className={order.status === 'Processing' ? 'animate-spin' : ''} />
                <span className="text-xs font-black uppercase tracking-widest">{status.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-8">
        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-display font-black text-gray-900 tracking-tighter">Delivery Progress</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Real-time tracking from provider</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-display font-black text-brand-purple tracking-tighter">{Math.round(progress)}%</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg shadow-blue-600/20"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-center space-y-2">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ordered</div>
                <div className="text-xl font-display font-black text-gray-900">{order.quantity.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-center space-y-2">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Start Count</div>
                <div className="text-xl font-display font-black text-gray-900">{order.start_count?.toLocaleString() || '---'}</div>
              </div>
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center space-y-2">
                <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Delivered</div>
                <div className="text-xl font-display font-black text-emerald-600">{deliveredCount.toLocaleString()}</div>
              </div>
              <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 text-center space-y-2">
                <div className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Remaining</div>
                <div className="text-xl font-display font-black text-rose-600">{order.remains?.toLocaleString() || '---'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-8"
            >
              <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter flex items-center space-x-3">
                <FontAwesomeIcon icon={faRocket} className="text-brand-purple text-sm" />
                <span>Order Information</span>
              </h3>

              <div className="space-y-6">
                <div className="flex justify-between items-center py-4 border-b border-gray-50">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faHashtag} className="text-gray-300 text-xs" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</span>
                  </div>
                  <span className="text-xs font-black text-gray-900">#{order.id}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-50">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faLink} className="text-gray-300 text-xs" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Link</span>
                  </div>
                  <a href={order.link} target="_blank" rel="noreferrer" className="text-xs font-black text-brand-purple hover:underline truncate max-w-[200px]">{order.link}</a>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-50">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300 text-xs" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Created</span>
                  </div>
                  <span className="text-xs font-black text-gray-900">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-50">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faSyncAlt} className="text-gray-300 text-xs" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Update</span>
                  </div>
                  <span className="text-xs font-black text-gray-900">{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '---'}</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-gray-300 text-xs" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Provider ID</span>
                  </div>
                  <span className="text-xs font-black text-gray-500">#{order.apiOrderId || '---'}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payment & Profit (Admin Only) */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-8"
            >
              <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter flex items-center space-x-3">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-emerald-500 text-sm" />
                <span>Payment Details</span>
              </h3>

              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Price</div>
                  <div className="text-xl font-display font-black text-gray-900">UGX {order.price?.toLocaleString()}</div>
                </div>

                {userData?.role === 'admin' && (
                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faCoins} className="text-gray-300 text-[10px]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Provider Cost</span>
                      </div>
                      <span className="text-xs font-black text-gray-500">UGX {order.provider_cost?.toLocaleString() || '---'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faChartLine} className="text-emerald-500 text-[10px]" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Profit Earned</span>
                      </div>
                      <span className="text-xs font-black text-emerald-600">UGX {order.profit?.toLocaleString() || '---'}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[3rem] text-white space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
              <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-brand-purple">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </div>
                <h4 className="text-lg font-display font-black tracking-tighter leading-tight">Need Help?</h4>
                <p className="text-white/50 text-[10px] font-bold leading-relaxed uppercase tracking-wider">If you have any issues with this order, please contact our support team with your Order ID.</p>
                <button className="w-full py-4 bg-white text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-all">Contact Support</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
