import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCode, faHistory, faUser, faClock, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';

export default function AdminApiLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const logsRef = ref(db, 'api_logs');
    const logsQuery = query(logsRef, limitToLast(100));
    
    onValue(logsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logsArray = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
        setLogs(logsArray.reverse());
      } else {
        setLogs([]);
      }
      setIsLoading(false);
    });
  }, []);

  const filteredLogs = logs.filter(log => 
    log.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ip?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tighter mb-2">API Logs</h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Monitor public API usage</p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div className="flex items-center space-x-4 w-full md:max-w-xl">
            <div className="relative group flex-grow">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <input
                type="text"
                placeholder="Search logs by User ID, Action, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all w-full font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="pb-6 px-4">Timestamp</th>
                <th className="pb-6 px-4">User ID</th>
                <th className="pb-6 px-4">Action</th>
                <th className="pb-6 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map((log, idx) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="py-6 px-4 text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="text-gray-300 text-[10px]" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-xs font-black text-gray-900 group-hover:text-brand-purple transition-colors">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-gray-300 text-[10px]" />
                      #{log.userId?.slice(-6).toUpperCase()}
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple text-[8px] font-black uppercase tracking-widest rounded-full border border-brand-purple/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faNetworkWired} className="text-gray-300 text-[10px]" />
                      {log.ip || 'Unknown'}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && !isLoading && (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-3xl mx-auto">
                <FontAwesomeIcon icon={faHistory} />
              </div>
              <div className="text-gray-400 font-black uppercase tracking-widest text-xs">No API logs found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
