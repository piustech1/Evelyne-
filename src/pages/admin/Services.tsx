import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faToggleOn, faToggleOff, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

const services = [
  { id: '101', name: 'Instagram Followers [Real/Active]', category: 'Instagram', price: 'UGX 2,400', min: '100', max: '50,000', provider: 'JAP', status: 'Active' },
  { id: '102', name: 'TikTok Likes [Instant]', category: 'TikTok', price: 'UGX 800', min: '50', max: '100,000', provider: 'PerfectPanel', status: 'Active' },
  { id: '103', name: 'YouTube Views [High Retention]', category: 'YouTube', price: 'UGX 12,000', min: '500', max: '1,000,000', provider: 'JAP', status: 'Disabled' },
];

export default function AdminServices() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-dark tracking-tighter mb-2">Services</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Manage your SMM services and pricing</p>
        </div>
        <button className="px-8 py-4 gradient-brand text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all active:scale-95 flex items-center space-x-3">
          <FontAwesomeIcon icon={faPlus} />
          <span>Add New Service</span>
        </button>
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
                placeholder="Search services..."
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
                <th className="pb-6 px-4">ID</th>
                <th className="pb-6 px-4">Service Name</th>
                <th className="pb-6 px-4">Category</th>
                <th className="pb-6 px-4">Price / 1k</th>
                <th className="pb-6 px-4 text-center">Min/Max</th>
                <th className="pb-6 px-4">Provider</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map((service, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-brand-light/30 transition-colors"
                >
                  <td className="py-6 px-4 text-sm font-black text-brand-dark">{service.id}</td>
                  <td className="py-6 px-4 text-sm font-bold text-gray-700">{service.name}</td>
                  <td className="py-6 px-4 text-sm font-bold text-gray-500">{service.category}</td>
                  <td className="py-6 px-4 text-sm font-black text-brand-orange">{service.price}</td>
                  <td className="py-6 px-4 text-sm font-bold text-gray-400 text-center">{service.min} / {service.max}</td>
                  <td className="py-6 px-4 text-sm font-bold text-gray-500">{service.provider}</td>
                  <td className="py-6 px-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      service.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className={`w-9 h-9 rounded-xl bg-gray-50 transition-all flex items-center justify-center ${
                        service.status === 'Active' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-100'
                      }`}>
                        <FontAwesomeIcon icon={service.status === 'Active' ? faToggleOn : faToggleOff} />
                      </button>
                      <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center">
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
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
