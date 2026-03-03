import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faGripVertical, faTags } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active',
    sort: 0,
    keywords: ''
  });

  useEffect(() => {
    const categoriesRef = ref(db, 'categories');
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCategories(Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })).sort((a, b) => a.sort - b.sort));
      } else {
        setCategories([]);
      }
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await update(ref(db, `categories/${editingCategory.id}`), formData);
      } else {
        const newRef = push(ref(db, 'categories'));
        await set(newRef, { ...formData, createdAt: new Date().toISOString() });
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', status: 'Active', sort: 0 });
    } catch (err) {
      console.error('Failed to save category', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? All services in this category will remain but will be uncategorized.')) {
      try {
        await remove(ref(db, `categories/${id}`));
      } catch (err) {
        console.error('Failed to delete category', err);
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter mb-2">Categories</h1>
          <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Organize your services into logical groups</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', status: 'Active', sort: categories.length });
            setIsModalOpen(true);
          }}
          className="px-8 py-4 gradient-brand text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-brand-blue/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center space-x-3"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-brand-card p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="pb-6 px-4">Sort</th>
                <th className="pb-6 px-4">ID</th>
                <th className="pb-6 px-4">Category Name</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((cat, idx) => (
                <motion.tr
                  key={cat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-white/5 transition-colors"
                >
                  <td className="py-6 px-4 text-gray-700 cursor-move">
                    <FontAwesomeIcon icon={faGripVertical} />
                  </td>
                  <td className="py-6 px-4 text-xs font-black text-white">#{cat.id.slice(-4).toUpperCase()}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-400">{cat.name}</td>
                  <td className="py-6 px-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      cat.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {cat.status}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => {
                          setEditingCategory(cat);
                          setFormData({ name: cat.name, status: cat.status, sort: cat.sort, keywords: cat.keywords || '' });
                          setIsModalOpen(true);
                        }}
                        className="w-10 h-10 rounded-xl bg-white/5 text-gray-500 hover:text-brand-blue hover:bg-brand-blue/10 transition-all flex items-center justify-center border border-white/5"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="w-10 h-10 rounded-xl bg-white/5 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center border border-white/5"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && !isLoading && (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700 text-3xl mx-auto">
                <FontAwesomeIcon icon={faTags} />
              </div>
              <div className="text-gray-600 font-black uppercase tracking-widest text-xs">No categories found</div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-card w-full max-w-md rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/10 relative z-10"
          >
            <h2 className="text-3xl font-display font-black text-white tracking-tighter mb-10">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                  placeholder="e.g. Instagram"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                  placeholder="e.g. Instagram, IG, Insta"
                />
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest ml-1">Used to auto-match services from API</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold appearance-none"
                  >
                    <option value="Active" className="bg-brand-dark">Active</option>
                    <option value="Disabled" className="bg-brand-dark">Disabled</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort}
                    onChange={(e) => setFormData({ ...formData, sort: Number(e.target.value) })}
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-2 py-5 gradient-brand text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
