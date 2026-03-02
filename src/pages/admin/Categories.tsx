import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

const categories = [
  { id: '1', name: 'Instagram', services: '42', status: 'Active' },
  { id: '2', name: 'TikTok', services: '28', status: 'Active' },
  { id: '3', name: 'YouTube', services: '15', status: 'Active' },
  { id: '4', name: 'Facebook', services: '22', status: 'Active' },
  { id: '5', name: 'Twitter', services: '12', status: 'Active' },
];

export default function AdminCategories() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-dark tracking-tighter mb-2">Categories</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Organize your services into logical groups</p>
        </div>
        <button className="px-8 py-4 gradient-brand text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all active:scale-95 flex items-center space-x-3">
          <FontAwesomeIcon icon={faPlus} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="pb-6 px-4">Sort</th>
                <th className="pb-6 px-4">ID</th>
                <th className="pb-6 px-4">Category Name</th>
                <th className="pb-6 px-4 text-center">Services</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-brand-light/30 transition-colors"
                >
                  <td className="py-6 px-4 text-gray-300 cursor-move">
                    <FontAwesomeIcon icon={faGripVertical} />
                  </td>
                  <td className="py-6 px-4 text-sm font-black text-brand-dark">{cat.id}</td>
                  <td className="py-6 px-4 text-sm font-bold text-gray-700">{cat.name}</td>
                  <td className="py-6 px-4 text-sm font-black text-brand-dark text-center">{cat.services}</td>
                  <td className="py-6 px-4">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                      {cat.status}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center">
                        <FontAwesomeIcon icon={faEdit} />
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
