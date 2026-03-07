import { useState, useEffect, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faPlus, faHistory, faArrowUp, faArrowDown, faCheckCircle, faMobileAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, onValue, push, set, query, orderByChild, equalTo } from 'firebase/database';

export default function Wallet() {
  const { user, userData } = useAuth();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'airtel'>('mtn');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

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

  const handleDeposit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;
    if (Number(amount) < 1000) {
      toast.error('Minimum deposit is UGX 1,000');
      return;
    }
    if (!phoneNumber) {
      toast.error('Please provide a phone number');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Initiating payment prompt...');

    try {
      const GAS_URL = 'https://script.google.com/macros/s/AKfycbx3R9hK-5O-ROqvY3XVkBaqOgSE1XXolFg35xD73p__aY274FHPNZN3qeNE1dnZMjmy/exec';
      
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // GAS requires text/plain for CORS sometimes or handles it better
        body: JSON.stringify({
          userId: user.uid,
          username: userData.name,
          userEmail: user.email,
          phone: phoneNumber,
          amount: Number(amount)
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Payment initiation failed');

      toast.success('Payment prompt sent! Please check your phone.', { id: loadingToast });
      setAmount('');
      setPhoneNumber('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate payment', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
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
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('mtn')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover-lift active-press ${
                      paymentMethod === 'mtn' 
                      ? 'border-brand-purple bg-brand-purple/5 text-brand-purple shadow-sm' 
                      : 'border-white bg-white text-gray-400 hover:border-brand-purple/20 shadow-sm'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden mb-2 shadow-sm border border-white">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg" 
                        alt="MTN" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest">MTN MoMo</span>
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
                    <div className="w-12 h-12 rounded-full overflow-hidden mb-2 shadow-sm border border-white">
                      <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRneg0-d64LfRJ004eYrlfQWrRaRrDSStBFSbWPZKEmQg&s" 
                        alt="Airtel" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest">Airtel Money</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 ml-1 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07XX XXX XXX"
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold text-xs shadow-sm"
                  />
                </div>

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
