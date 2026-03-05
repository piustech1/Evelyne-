import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faEye, faSearch, faFilter, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, update, runTransaction } from 'firebase/database';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const paymentsRef = ref(db, 'payments');
    onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const paymentsArray = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPayments(paymentsArray);
        setFilteredPayments(paymentsArray);
      } else {
        setPayments([]);
        setFilteredPayments([]);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const result = payments.filter(pay => 
      pay.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPayments(result);
  }, [searchTerm, payments]);

  const handleApprove = async (payment: any) => {
    if (payment.status !== 'Pending') return;
    
    try {
      // 1. Update payment status
      await update(ref(db, `payments/${payment.id}`), { status: 'Approved' });
      
      // 2. Update user balance using transaction
      const userBalanceRef = ref(db, `users/${payment.userId}/balance`);
      await runTransaction(userBalanceRef, (currentBalance) => {
        return (currentBalance || 0) + payment.amount;
      });
      
      alert('Payment approved and balance updated!');
    } catch (err) {
      console.error('Approval failed', err);
      alert('Failed to approve payment');
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      await update(ref(db, `payments/${paymentId}`), { status: 'Rejected' });
      alert('Payment rejected');
    } catch (err) {
      console.error('Rejection failed', err);
      alert('Failed to reject payment');
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tighter mb-2">Payments</h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Monitor and manage all financial transactions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Pending Requests: <span className="text-amber-500">{payments.filter(p => p.status === 'Pending').length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div className="flex items-center space-x-4 w-full md:max-w-xl">
            <div className="relative group flex-grow">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all w-full font-bold text-sm"
              />
            </div>
            <button className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-brand-purple hover:border-brand-purple transition-all group flex items-center justify-center">
              <FontAwesomeIcon icon={faFilter} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="pb-6 px-4">ID</th>
                <th className="pb-6 px-4">User</th>
                <th className="pb-6 px-4">Amount</th>
                <th className="pb-6 px-4">Method</th>
                <th className="pb-6 px-4">Phone / Info</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4">Date</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map((pay, idx) => (
                <motion.tr
                  key={pay.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="py-6 px-4 text-xs font-black text-gray-900 group-hover:text-brand-purple transition-colors">#{pay.id.slice(-6).toUpperCase()}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-500">{pay.userEmail}</td>
                  <td className="py-6 px-4 text-xs font-black text-gray-900">UGX {pay.amount?.toLocaleString()}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-400">{pay.method}</td>
                  <td className="py-6 px-4 text-xs font-mono text-gray-400">{pay.phoneNumber || 'N/A'}</td>
                  <td className="py-6 px-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      pay.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      pay.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-[10px] font-bold text-gray-400">{new Date(pay.createdAt).toLocaleDateString()}</td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {pay.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(pay)}
                            className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center border border-emerald-500/20"
                            title="Approve Payment"
                          >
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </button>
                          <button 
                            onClick={() => handleReject(pay.id)}
                            className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-rose-500/20"
                            title="Reject Payment"
                          >
                            <FontAwesomeIcon icon={faTimesCircle} />
                          </button>
                        </>
                      )}
                      <button className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-purple hover:bg-gray-100 transition-all flex items-center justify-center border border-gray-100">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && !isLoading && (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-3xl mx-auto">
                <FontAwesomeIcon icon={faMoneyBillWave} />
              </div>
              <div className="text-gray-400 font-black uppercase tracking-widest text-xs">No payment requests found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
