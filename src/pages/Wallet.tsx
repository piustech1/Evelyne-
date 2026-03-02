import { useState, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faPlus, faHistory, faArrowUp, faArrowDown, faCheckCircle, faMobileAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

export default function Wallet() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'airtel'>('mtn');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions] = useState<any[]>([]); // Empty for now

  const handleDeposit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Logic will be added later
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Balance Card & Add Funds */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="gradient-brand p-10 rounded-[3rem] text-white shadow-2xl shadow-brand-orange/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl" />
            
            <div className="relative z-10">
              <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Available Balance</div>
              <div className="text-5xl font-display font-bold mb-10 tracking-tight">UGX 0</div>
              
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Total Spent</span>
                  <span className="text-lg font-bold">UGX 0</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Total Orders</span>
                  <span className="text-lg font-bold">0</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50">
            <h2 className="text-2xl font-bold text-brand-dark mb-8 flex items-center tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faPlus} className="text-brand-orange text-sm" />
              </div>
              Add Funds
            </h2>
            <form className="space-y-8" onSubmit={handleDeposit}>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('mtn')}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all shadow-sm ${
                      paymentMethod === 'mtn' 
                      ? 'border-brand-orange bg-brand-light text-brand-orange' 
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-brand-orange/20'
                    }`}
                  >
                    <div className="w-10 h-10 bg-[#FFCC00] rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <FontAwesomeIcon icon={faMobileAlt} className="text-black text-sm" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">MTN MoMo</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('airtel')}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all shadow-sm ${
                      paymentMethod === 'airtel' 
                      ? 'border-brand-orange bg-brand-light text-brand-orange' 
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-brand-orange/20'
                    }`}
                  >
                    <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <FontAwesomeIcon icon={faMobileAlt} className="text-white text-sm" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Airtel Money</span>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">Amount (UGX)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-orange font-bold">
                    UGX
                  </div>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="5,000"
                    className="w-full pl-14 pr-4 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange focus:bg-white transition-all font-bold text-lg"
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Minimum deposit: UGX 5,000</p>
              </div>
              <button 
                disabled={isLoading}
                className="w-full py-5 gradient-brand text-white font-bold rounded-2xl shadow-xl shadow-brand-orange/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Deposit Funds'}
              </button>
            </form>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-8">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50 h-full">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-brand-dark flex items-center tracking-tight">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faHistory} className="text-brand-orange text-sm" />
                </div>
                Transaction History
              </h2>
            </div>
            
            <div className="space-y-5">
              {transactions.length > 0 ? (
                transactions.map((txn, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-5 rounded-[2rem] bg-brand-light/50 border border-transparent hover:border-brand-orange/10 hover:bg-white hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center space-x-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg shadow-lg transition-transform group-hover:scale-110 ${
                        txn.type === 'Deposit' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-brand-orange shadow-brand-orange/20'
                      }`}>
                        <FontAwesomeIcon icon={txn.type === 'Deposit' ? faArrowDown : faArrowUp} />
                      </div>
                      <div>
                        <div className="text-base font-bold text-brand-dark group-hover:text-brand-orange transition-colors">{txn.type} via {txn.method}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{txn.date} • {txn.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        txn.type === 'Deposit' ? 'text-emerald-500' : 'text-brand-dark'
                      }`}>{txn.amount}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center justify-end gap-1">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {txn.status}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 text-3xl">
                    <FontAwesomeIcon icon={faWallet} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-brand-dark">No transactions yet</h3>
                    <p className="text-sm text-gray-400 max-w-xs">Your transaction history will appear here once you start using your wallet.</p>
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
