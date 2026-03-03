import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faToggleOn, faToggleOff, faSearch, faFilter, faList } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    min: '100',
    max: '10000',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    const servicesRef = ref(db, 'services');
    const categoriesRef = ref(db, 'categories');

    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCategories(Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })));
      }
    });

    onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setServices(Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })));
      } else {
        setServices([]);
      }
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const category = categories.find(c => c.id === formData.categoryId);
      const serviceData = {
        ...formData,
        categoryName: category?.name || '',
        price: Number(formData.price),
        min: Number(formData.min),
        max: Number(formData.max),
        updatedAt: new Date().toISOString()
      };

      if (editingService) {
        await update(ref(db, `services/${editingService.id}`), serviceData);
      } else {
        const newServiceRef = push(ref(db, 'services'));
        await set(newServiceRef, { ...serviceData, createdAt: new Date().toISOString() });
      }
      
      setIsModalOpen(false);
      setEditingService(null);
      setFormData({ name: '', categoryId: '', price: '', min: '100', max: '10000', description: '', status: 'Active' });
    } catch (err) {
      console.error('Failed to save service', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await remove(ref(db, `services/${id}`));
      } catch (err) {
        console.error('Failed to delete service', err);
      }
    }
  };

  const toggleStatus = async (service: any) => {
    const newStatus = service.status === 'Active' ? 'Disabled' : 'Active';
    try {
      await update(ref(db, `services/${service.id}`), { status: newStatus });
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter mb-2">Services</h1>
          <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Manage your SMM services and pricing</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setFormData({ name: '', categoryId: '', price: '', min: '100', max: '10000', description: '', status: 'Active' });
            setIsModalOpen(true);
          }}
          className="px-8 py-4 gradient-brand text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-brand-blue/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center space-x-3"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="bg-brand-card p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div className="flex items-center space-x-4 w-full md:max-w-xl">
            <div className="relative group flex-grow">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-600 group-focus-within:text-brand-purple transition-colors">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white/10 transition-all w-full font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="pb-6 px-4">ID</th>
                <th className="pb-6 px-4">Service Name</th>
                <th className="pb-6 px-4 hidden sm:table-cell">Category</th>
                <th className="pb-6 px-4">Price / 1k</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredServices.map((service, idx) => (
                <motion.tr
                  key={service.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-white/5 transition-colors"
                >
                  <td className="py-6 px-4 text-xs font-black text-white">#{service.id.slice(-4).toUpperCase()}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-400 truncate max-w-[200px]">{service.name}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-600 hidden sm:table-cell">{service.categoryName}</td>
                  <td className="py-6 px-4 text-xs font-black text-brand-purple">UGX {service.price?.toLocaleString()}</td>
                  <td className="py-6 px-4">
                    <button 
                      onClick={() => toggleStatus(service)}
                      className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        service.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}
                    >
                      <FontAwesomeIcon icon={service.status === 'Active' ? faToggleOn : faToggleOff} className="mr-2" />
                      {service.status}
                    </button>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => {
                          setEditingService(service);
                          setFormData({
                            name: service.name,
                            categoryId: service.categoryId,
                            price: service.price.toString(),
                            min: service.min.toString(),
                            max: service.max.toString(),
                            description: service.description || '',
                            status: service.status
                          });
                          setIsModalOpen(true);
                        }}
                        className="w-10 h-10 rounded-xl bg-white/5 text-gray-500 hover:text-brand-blue hover:bg-brand-blue/10 transition-all flex items-center justify-center border border-white/5"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)}
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
          {filteredServices.length === 0 && !isLoading && (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700 text-3xl mx-auto">
                <FontAwesomeIcon icon={faList} />
              </div>
              <div className="text-gray-600 font-black uppercase tracking-widest text-xs">No services found</div>
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
            className="bg-brand-card w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/10 relative z-10 overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <h2 className="text-3xl font-display font-black text-white tracking-tighter mb-10">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                  placeholder="e.g. Instagram Followers [Real]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold appearance-none"
                  >
                    <option value="" className="bg-brand-dark">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-brand-dark">{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Price per 1k (UGX)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                    placeholder="2400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Min Order</label>
                  <input
                    type="number"
                    required
                    value={formData.min}
                    onChange={(e) => setFormData({ ...formData, min: e.target.value })}
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Max Order</label>
                  <input
                    type="number"
                    required
                    value={formData.max}
                    onChange={(e) => setFormData({ ...formData, max: e.target.value })}
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold h-32"
                  placeholder="Service details..."
                />
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
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
