import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faHistory,
  faUser,
  faMoneyBillWave,
  faCalendarAlt,
  faHashtag
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function AdminRefundLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const logsRef = ref(db, 'refund_logs');
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logsArray = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        })).sort((a: any, b: any) => b.timestamp - a.timestamp);
        setLogs(logsArray);
        setFilteredLogs(logsArray);
      } else {
        setLogs([]);
        setFilteredLogs([]);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = logs;
    if (searchTerm) {
      result = result.filter(log => 
        log.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredLogs(result);
  }, [searchTerm, logs]);

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tighter mb-2">Refund Logs</h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Track all automated refunds to user wallets</p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center space-x-3 text-[10px] font-black text-brand-purple uppercase tracking-widest bg-brand-purple/10 px-6 py-3 rounded-2xl border border-brand-purple/20 shadow-sm">
            <FontAwesomeIcon icon={faHistory} />
            <span>Audit Trail Active</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div className="relative group w-full md:max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <input
              type="text"
              placeholder="Search by Order ID or User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all w-full font-bold text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="pb-6 px-4">Order ID</th>
                <th className="pb-6 px-4">User ID</th>
                <th className="pb-6 px-4">Amount</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map((log, idx) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="py-6 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-brand-purple/10 group-hover:text-brand-purple transition-colors">
                        <FontAwesomeIcon icon={faHashtag} className="text-[10px]" />
                      </div>
                      <span className="text-xs font-black text-gray-900">#{log.orderId?.slice(-8).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                      </div>
                      <span className="text-xs font-bold text-gray-500">{log.userId?.slice(0, 12)}...</span>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-[10px]" />
                      </div>
                      <span className="text-xs font-black text-emerald-600">UGX {Math.round(log.amount).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      log.status === 'Canceled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-brand-purple/10 text-brand-purple border-brand-purple/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-3 text-gray-400">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
                      <span className="text-[10px] font-bold">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && !isLoading && (
            <div className="py-20 text-center">
              <div className="text-gray-400 font-black uppercase tracking-widest text-xs">No refund logs found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
