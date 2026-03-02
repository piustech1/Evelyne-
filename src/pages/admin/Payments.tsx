import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faEye, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

const payments = [
  { id: '#PAY-1021', user: 'john_doe', amount: 'UGX 124,500', method: 'MTN MoMo', transactionId: 'TXN-84921', status: 'Successful', date: '2026-03-02 05:40' },
  { id: '#PAY-1020', user: 'sarah_smith', amount: 'UGX 45,000', method: 'Airtel Money', transactionId: 'TXN-84920', status: 'Pending', date: '2026-03-02 05:25' },
  { id: '#PAY-1019', user: 'mike_ross', amount: 'UGX 12,000', method: 'MTN MoMo', transactionId: 'TXN-84919', status: 'Failed', date: '2026-03-02 04:40' },
];

export default function AdminPayments() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-dark tracking-tighter mb-2">Payments</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Monitor and manage all financial transactions</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center space-x-4 w-full md:max-w-xl">
            <div className="relative group flex-grow">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-orange transition-colors">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <input
                type="text"
                placeholder="Search payments..."
                className="pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all w-full font-bold text-sm"
              />
            </div>
            <button className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-brand-orange hover:border-brand-orange transition-all group">
              <FontAwesomeIcon icon={faFilter} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="pb-6 px-4">Payment ID</th>
                <th className="pb-6 px-4">User</th>
                <th className="pb-6 px-4">Amount</th>
                <th className="pb-6 px-4">Method</th>
                <th className="pb-6 px-4">Transaction ID</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4">Date</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((pay, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-brand-light/30 transition-colors"
                >
                  <td className="py-6 px-4 text-sm font-black text-brand-dark">{pay.id}</td>
                  <td className="py-6 px-4 text-sm font-bold text-gray-500">{pay.user}</td>
                  <td className="py-6 px-4 text-sm font-black text-brand-dark">{pay.amount}</td>
                  <td className="py-6 px-4 text-sm font-bold text-gray-700">{pay.method}</td>
                  <td className="py-6 px-4 text-xs font-mono text-gray-400">{pay.transactionId}</td>
                  <td className="py-6 px-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      pay.status === 'Successful' ? 'bg-emerald-100 text-emerald-600' :
                      pay.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-400">{pay.date}</td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all flex items-center justify-center">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      {pay.status === 'Pending' && (
                        <>
                          <button className="w-9 h-9 rounded-xl bg-gray-50 text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center">
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </button>
                          <button className="w-9 h-9 rounded-xl bg-gray-50 text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center">
                            <FontAwesomeIcon icon={faTimesCircle} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
