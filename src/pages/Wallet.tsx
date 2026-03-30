import { useState, useEffect, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faPlus, faHistory, faArrowUp, faArrowDown, faCheckCircle, faMobileAlt, faInfoCircle, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, onValue, push, set, query, orderByChild, equalTo } from 'firebase/database';
import WhatsAppCommunity from '../components/WhatsAppCommunity';

export default function Wallet() {
  const { user, userData } = useAuth();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'airtel' | 'card'>('mtn');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed' | 'idle'>('idle');
  const [lastBalance, setLastBalance] = useState(0);

  useEffect(() => {
    if (userData?.balance !== undefined) {
      console.log(`[Wallet] Balance check: Current=${userData.balance}, Last=${lastBalance}, Modal=${showPaymentModal}, Status=${paymentStatus}`);
      // If balance increased while modal is showing, show success
      if (showPaymentModal && paymentStatus === 'processing' && userData.balance > lastBalance) {
        console.log(`[Wallet] Balance increased! Switching to success state.`);
        setPaymentStatus('success');
        toast.success(`UGX ${(userData.balance - lastBalance).toLocaleString()} added to wallet!`);
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentStatus('idle');
        }, 3000);
      }
      setLastBalance(userData.balance);
    }
  }, [userData?.balance, showPaymentModal, paymentStatus, lastBalance]);

  useEffect(() => {
    if (user) {
      const paymentsRef = ref(db, 'payments');
      const userPaymentsQuery = query(paymentsRef, orderByChild('userId'), equalTo(user.uid));
      
      onValue(userPaymentsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const paymentsArray = Object.entries(data).map(([id, value]: [string, any]) => ({
            id,
            ...value,
          })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTransactions(paymentsArray);
        } else {
          setTransactions([]);
        }
        setIsDataLoading(false);
      });
    }
  }, [user]);

  const formatPhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '256' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('256') && cleaned.length === 9) {
      cleaned = '256' + cleaned;
    }
    return '+' + cleaned;
  };

  const handleDeposit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;
    
    if (Number(amount) < 1000) {
      toast.error('Minimum deposit is UGX 1,000');
      return;
    }
    
    if (paymentMethod !== 'card' && !phoneNumber) {
      toast.error('Please provide a phone number');
      return;
    }

    const formattedPhone = paymentMethod !== 'card' ? formatPhoneNumber(phoneNumber) : '';
    
    setIsLoading(true);
    setShowPaymentModal(true);
    setPaymentStatus('processing');

    const GAS_URL = import.meta.env.VITE_SMM_GAS_URL;
    const payload = {
      userId: user.uid,
      username: userData.name,
      userEmail: user.email,
      phone: formattedPhone,
      amount: Number(amount),
      method: paymentMethod === 'card' ? 'card' : 'mobile_money'
    };

    try {
      // Try local server first
      let response;
      let result;
      
      try {
        response = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          throw new Error('Non-JSON response');
        }
      } catch (localErr) {
        console.warn('Local API failed, falling back to GAS:', localErr);
        // Fallback to GAS URL directly if local API fails (common on Vercel)
        if (!GAS_URL) throw new Error('Payment gateway configuration missing.');
        
        response = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        result = await response.json();
      }

      if (result.success || result.status === 'success') {
        toast.success("Payment initiated! Please complete the prompt on your phone.");
        
        if (result.redirectUrl) {
          // Handle Card payment redirect
          window.open(result.redirectUrl, '_blank');
        }

        // Start polling for status (Backup Verification System)
        if (result.reference) {
          pollPaymentStatus(result.reference);
        }
      } else {
        throw new Error(result.message || "Failed to initiate payment");
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.message || 'Failed to initiate payment');
      setPaymentStatus('failed');
      setTimeout(() => setShowPaymentModal(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Polling for payment status (Backup Verification System)
  const pollPaymentStatus = async (reference: string) => {
    const GAS_URL = import.meta.env.VITE_SMM_GAS_URL;
    const pollInterval = setInterval(async () => {
      try {
        let response;
        let data;

        try {
          response = await fetch(`/api/payment/status/${reference}`);
          if (response.ok) {
            data = await response.json();
          } else {
            throw new Error('Local status check failed');
          }
        } catch (e) {
          // If local status check fails, we rely on the balance listener in useEffect
          // or we could potentially poll GAS if we added a status check there.
          // For now, we'll just log it.
          console.log('Local status check failed, relying on balance listener.');
          return;
        }
        
        if (data && (data.status === 'completed' || data.status === 'success')) {
          clearInterval(pollInterval);
          setPaymentStatus('success');
          toast.success(`UGX ${Number(amount).toLocaleString()} added to wallet!`);
          
          // Clear form
          setAmount('');
          setPhoneNumber('');
          
          // Close modal after delay
          setTimeout(() => {
            setShowPaymentModal(false);
            setPaymentStatus('idle');
          }, 3000);
        } else if (data && data.status === 'failed') {
          clearInterval(pollInterval);
          setPaymentStatus('failed');
          toast.error("Payment failed or was cancelled.");
          setTimeout(() => {
            setShowPaymentModal(false);
            setPaymentStatus('idle');
          }, 3000);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (showPaymentModal && paymentStatus === 'processing') {
        setShowPaymentModal(false);
        setPaymentStatus('idle');
        toast.error("Payment verification timed out. If you were charged, your balance will update shortly.");
      }
    }, 600000);
  };

  return (
    <div className="pt-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-sm w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center space-y-6"
            >
              {paymentStatus === 'processing' ? (
                <>
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto border border-blue-100 shadow-sm relative overflow-hidden">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-blue-600 text-3xl"
                    >
                      <FontAwesomeIcon icon={faSpinner} />
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter">Processing Payment</h3>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed">
                      Please complete the Mobile Money prompt on your phone. Your wallet will update automatically.
                    </p>
                  </div>
                </>
              ) : paymentStatus === 'success' ? (
                <>
                  <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm relative overflow-hidden">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-emerald-500 text-3xl"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-black text-emerald-500 tracking-tighter">Payment Successful</h3>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed">
                      Your wallet has been topped up.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto border border-rose-100 shadow-sm relative overflow-hidden">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-rose-500 text-3xl"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-black text-rose-500 tracking-tighter">Payment Failed</h3>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed">
                      Something went wrong or the payment was cancelled.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Balance Card & Add Funds */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="gradient-brand p-8 rounded-3xl text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            
            <div className="relative z-10">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Available Balance</div>
              <div className="text-3xl font-display font-black mb-8 tracking-tighter">UGX {userData?.balance?.toLocaleString() || 0}</div>
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/50 mb-1">Total Spent</span>
                  <span className="text-base font-black tracking-tight">UGX 0</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/50 mb-1">Total Orders</span>
                  <span className="text-base font-black tracking-tight">0</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-gray-50 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-black text-gray-900 mb-8 flex items-center tracking-tighter">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-3 border border-blue-100 shadow-sm">
                <FontAwesomeIcon icon={faPlus} className="text-blue-600 text-xs" />
              </div>
              Add Funds
            </h2>

            <form className="space-y-6" onSubmit={handleDeposit}>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-gray-500 ml-1 uppercase tracking-widest">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('mtn')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover-lift active-press ${
                      paymentMethod === 'mtn' 
                      ? 'border-brand-purple bg-brand-purple/5 text-brand-purple shadow-sm' 
                      : 'border-white bg-white text-gray-400 hover:border-brand-purple/20 shadow-sm'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden mb-2 shadow-sm border border-white">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg" 
                        alt="MTN" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest">MTN</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('airtel')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover-lift active-press ${
                      paymentMethod === 'airtel' 
                      ? 'border-brand-purple bg-brand-purple/5 text-brand-purple shadow-sm' 
                      : 'border-white bg-white text-gray-400 hover:border-brand-purple/20 shadow-sm'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden mb-2 shadow-sm border border-white">
                      <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRneg0-d64LfRJ004eYrlfQWrRaRrDSStBFSbWPZKEmQg&s" 
                        alt="Airtel" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest">Airtel</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover-lift active-press ${
                      paymentMethod === 'card' 
                      ? 'border-brand-purple bg-brand-purple/5 text-brand-purple shadow-sm' 
                      : 'border-white bg-white text-gray-400 hover:border-brand-purple/20 shadow-sm'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden mb-2 shadow-sm border border-white bg-gray-100 flex items-center justify-center text-gray-400">
                      <FontAwesomeIcon icon={faMobileAlt} className="text-lg" />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest">Card</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {paymentMethod !== 'card' && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-500 ml-1 uppercase tracking-widest">
                      Mobile Money Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="07XX XXX XXX"
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold text-xs shadow-sm"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 ml-1 uppercase tracking-widest">Amount (UGX)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-purple font-black text-[10px]">
                      UGX
                    </div>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="5,000"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-display font-black text-xl shadow-sm"
                    />
                  </div>
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest ml-1">Min: UGX 1,000</p>
                </div>
              </div>

              <button 
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-xl shadow-sm hover:scale-[1.02] active-press transition-all text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Deposit Funds'}
              </button>
            </form>
          </div>

          <WhatsAppCommunity />
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-8">
          <div className="bg-gray-50 p-6 md:p-10 rounded-3xl shadow-sm border border-gray-200 h-full relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-xl font-display font-black text-gray-900 flex items-center tracking-tighter">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mr-3 border border-purple-100 shadow-sm">
                  <FontAwesomeIcon icon={faHistory} className="text-brand-purple text-xs" />
                </div>
                Transaction History
              </h2>
            </div>
            
            <div className="space-y-3 relative z-10">
              {isDataLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 shimmer" />
                ))
              ) : transactions.length > 0 ? (
                transactions.map((txn, idx) => (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-brand-purple/20 transition-all group shadow-sm hover-lift"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm shadow-sm transition-transform group-hover:scale-110 ${
                        txn.status?.toLowerCase() === 'successful' || txn.status?.toLowerCase() === 'completed' ? 'bg-emerald-500' : 
                        txn.status?.toLowerCase() === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}>
                        <FontAwesomeIcon icon={faArrowDown} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 group-hover:text-brand-purple transition-colors tracking-tight">Deposit via {txn.provider || 'MarzPay'}</div>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(txn.createdAt).toLocaleDateString()} • {txn.reference?.slice(-8) || txn.id?.slice(-8)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-display font-black ${
                        txn.status?.toLowerCase() === 'successful' || txn.status?.toLowerCase() === 'completed' ? 'text-emerald-500' : 'text-gray-900'
                      }`}>UGX {txn.amount?.toLocaleString()}</div>
                      <div className={`text-[9px] font-black uppercase tracking-widest flex items-center justify-end gap-1 mt-0.5 ${
                        txn.status?.toLowerCase() === 'successful' || txn.status?.toLowerCase() === 'completed' ? 'text-emerald-500' : 
                        txn.status?.toLowerCase() === 'pending' ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        <FontAwesomeIcon icon={txn.status?.toLowerCase() === 'successful' || txn.status?.toLowerCase() === 'completed' ? faCheckCircle : faInfoCircle} className="text-[8px]" />
                        {txn.status}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-200 text-2xl border border-gray-100">
                    <FontAwesomeIcon icon={faWallet} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-gray-900 tracking-tighter">No transactions yet</h3>
                    <p className="text-gray-400 text-[10px] font-medium max-w-xs mx-auto leading-relaxed">Your transaction history will appear here once you start using your wallet.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center pt-8">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
            Powered by Pius Tech
          </p>
        </div>
      </div>
    </div>
  );
}
