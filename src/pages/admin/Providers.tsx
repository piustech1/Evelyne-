import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faSyncAlt, faPlug, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

const providers = [
  { id: '1', name: 'JustAnotherPanel', url: 'https://justanotherpanel.com/api/v2', balance: 'USD 428.50', status: 'Active' },
  { id: '2', name: 'PerfectPanel', url: 'https://perfectpanel.com/api/v2', balance: 'USD 12.00', status: 'Active' },
  { id: '3', name: 'SMMKings', url: 'https://smmkings.com/api/v2', balance: 'USD 0.00', status: 'Disabled' },
];

export default function AdminProviders() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-dark tracking-tighter mb-2">Providers</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Connect and manage external SMM APIs</p>
        </div>
        <button className="px-8 py-4 gradient-brand text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all active:scale-95 flex items-center space-x-3">
          <FontAwesomeIcon icon={faPlus} />
          <span>Add New Provider</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center text-brand-orange text-2xl group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faPlug} />
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                provider.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {provider.status}
              </span>
            </div>
            
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-display font-black text-brand-dark">{provider.name}</h3>
              <div className="text-[10px] font-mono text-gray-400 truncate bg-gray-50 p-3 rounded-xl">{provider.url}</div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">API Balance</span>
                <span className="text-sm font-black text-emerald-500">{provider.balance}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center">
                <FontAwesomeIcon icon={faSyncAlt} />
              </button>
              <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center">
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center">
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
