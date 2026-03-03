import { useState, useEffect, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faPlus, faHistory, faArrowUp, faArrowDown, faCheckCircle, faMobileAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, onValue, push, set, query, orderByChild, equalTo } from 'firebase/database';

export default function Wallet() {
  const { user, userData } = useAuth();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'airtel'>('mtn');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      });
    }
  }, [user]);

  const handleDeposit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;
    if (Number(amount) < 5000) {
      setMessage({ type: 'error', text: 'Minimum deposit is UGX 5,000' });
      return;
    }
    if (!phoneNumber) {
      setMessage({ type: 'error', text: 'Please provide a phone number' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const paymentsRef = ref(db, 'payments');
      const newPaymentRef = push(paymentsRef);
      await set(newPaymentRef, {
        userId: user.uid,
        userName: userData.name,
        userEmail: user.email,
        amount: Number(amount),
        method: paymentMethod.toUpperCase(),
        phoneNumber,
        status: 'Pending',
        type: 'Deposit',
        createdAt: new Date().toISOString(),
      });

      setMessage({ type: 'success', text: 'Deposit request sent! Please wait for approval.' });
      setAmount('');
      setPhoneNumber('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit deposit request' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Balance Card & Add Funds */}
        <div className="lg:col-span-4 space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="gradient-brand p-10 rounded-[3.5rem] text-white shadow-2xl shadow-brand-blue/30 relative overflow-hidden border border-white/10"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl" />
            
            <div className="relative z-10">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-4">Available Balance</div>
              <div className="text-5xl font-display font-black mb-12 tracking-tighter">UGX {userData?.balance?.toLocaleString() || 0}</div>
              
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-2">Total Spent</span>
                  <span className="text-xl font-black tracking-tight">UGX 0</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-2">Total Orders</span>
                  <span className="text-xl font-black tracking-tight">0</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-brand-card p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5">
            <h2 className="text-2xl font-black text-white mb-10 flex items-center tracking-tighter">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center mr-4 border border-brand-blue/10">
                <FontAwesomeIcon icon={faPlus} className="text-brand-blue text-sm" />
              </div>
              Add Funds
            </h2>

            {message.text && (
              <div className={`mb-8 p-4 rounded-2xl text-xs font-bold text-center border ${
                message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              }`}>
                {message.text}
              </div>
            )}

            <form className="space-y-8" onSubmit={handleDeposit}>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('mtn')}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all shadow-xl ${
                      paymentMethod === 'mtn' 
                      ? 'border-brand-purple bg-brand-purple/5 text-brand-purple' 
                      : 'border-white/5 bg-white/5 text-gray-600 hover:border-brand-purple/20'
                    }`}
                  >
                    <div className="w-12 h-12 bg-[#FFCC00] rounded-full flex items-center justify-center mb-3 shadow-lg border-2 border-white/10">
                      <FontAwesomeIcon icon={faMobileAlt} className="text-black text-base" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">MTN MoMo</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('airtel')}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all shadow-xl ${
                      paymentMethod === 'airtel' 
                      ? 'border-brand-purple bg-brand-purple/5 text-brand-purple' 
                      : 'border-white/5 bg-white/5 text-gray-600 hover:border-brand-purple/20'
                    }`}
                  >
                    <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center mb-3 shadow-lg border-2 border-white/10">
                      <FontAwesomeIcon icon={faMobileAlt} className="text-white text-base" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Airtel Money</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07XX XXX XXX"
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">Amount (UGX)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-brand-purple font-black text-xs">
                      UGX
                    </div>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="5,000"
                      className="w-full pl-16 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-display font-black text-2xl"
                    />
                  </div>
                  <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest ml-1">Minimum deposit: UGX 5,000</p>
                </div>
              </div>

              <button 
                disabled={isLoading}
                className="w-full py-5 gradient-brand text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Deposit Funds'}
              </button>
            </form>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-8">
          <div className="bg-brand-card p-8 md:p-16 rounded-[3.5rem] shadow-2xl border border-white/5 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
            
            <div className="flex items-center justify-between mb-12 relative z-10">
              <h2 className="text-3xl font-display font-black text-white flex items-center tracking-tighter">
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center mr-4 border border-brand-purple/10">
                  <FontAwesomeIcon icon={faHistory} className="text-brand-purple text-sm" />
                </div>
                Transaction History
              </h2>
            </div>
            
            <div className="space-y-5 relative z-10">
              {transactions.length > 0 ? (
                transactions.map((txn, idx) => (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-6 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-brand-purple/20 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center space-x-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg shadow-xl transition-transform group-hover:scale-110 border border-white/10 ${
                        txn.status === 'Approved' ? 'bg-emerald-500' : 
                        txn.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}>
                        <FontAwesomeIcon icon={txn.type === 'Deposit' ? faArrowDown : faArrowUp} />
                      </div>
                      <div>
                        <div className="text-lg font-black text-white group-hover:text-brand-purple transition-colors tracking-tight">{txn.type} via {txn.method}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{new Date(txn.createdAt).toLocaleDateString()} • {txn.id.slice(-8)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-display font-black ${
                        txn.status === 'Approved' ? 'text-emerald-500' : 'text-white'
                      }`}>UGX {txn.amount?.toLocaleString()}</div>
                      <div className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-1 mt-1 ${
                        txn.status === 'Approved' ? 'text-emerald-500' : 
                        txn.status === 'Pending' ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        <FontAwesomeIcon icon={txn.status === 'Approved' ? faCheckCircle : faInfoCircle} />
                        {txn.status}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-700 text-4xl shadow-inner">
                    <FontAwesomeIcon icon={faWallet} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tighter">No transactions yet</h3>
                    <p className="text-gray-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">Your transaction history will appear here once you start using your wallet.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
