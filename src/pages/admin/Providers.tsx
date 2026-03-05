import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faSyncAlt, faPlug, faCheckCircle, faKey } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';

export default function AdminProviders() {
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    apiKey: '',
    status: 'Active'
  });

  useEffect(() => {
    const providersRef = ref(db, 'providers');
    onValue(providersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProviders(Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })));
      } else {
        setProviders([]);
      }
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProvider) {
        await update(ref(db, `providers/${editingProvider.id}`), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        const newRef = push(ref(db, 'providers'));
        await set(newRef, {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
      setEditingProvider(null);
      setFormData({ name: '', url: '', apiKey: '', status: 'Active' });
    } catch (err) {
      console.error('Failed to save provider', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      try {
        await remove(ref(db, `providers/${id}`));
      } catch (err) {
        console.error('Failed to delete provider', err);
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tighter mb-2">Providers</h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Connect and manage external SMM APIs</p>
        </div>
        <button 
          onClick={() => {
            setEditingProvider(null);
            setFormData({ name: '', url: '', apiKey: '', status: 'Active' });
            setIsModalOpen(true);
          }}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center space-x-3"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add New Provider</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {providers.map((provider, idx) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl group-hover:scale-110 transition-transform border border-blue-100 shadow-sm">
                <FontAwesomeIcon icon={faPlug} />
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                provider.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-100 text-gray-400 border-gray-200'
              }`}>
                {provider.status}
              </span>
            </div>
            
            <div className="space-y-4 mb-8">
              <h3 className="text-2xl font-display font-black text-gray-900 tracking-tighter">{provider.name}</h3>
              <div className="text-[10px] font-mono text-gray-400 truncate bg-gray-50 p-4 rounded-2xl border border-gray-100">{provider.url}</div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">API Status</span>
                <span className="text-xs font-black text-emerald-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Connected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-all flex items-center justify-center border border-gray-100">
                <FontAwesomeIcon icon={faSyncAlt} />
              </button>
              <button 
                onClick={() => {
                  setEditingProvider(provider);
                  setFormData({ name: provider.name, url: provider.url, apiKey: provider.apiKey, status: provider.status });
                  setIsModalOpen(true);
                }}
                className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-all flex items-center justify-center border border-gray-100"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button 
                onClick={() => handleDelete(provider.id)}
                className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center border border-gray-100"
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          </motion.div>
        ))}
        {providers.length === 0 && !isLoading && (
          <div className="col-span-full py-32 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-3xl mx-auto">
              <FontAwesomeIcon icon={faPlug} />
            </div>
            <div className="text-gray-400 font-black uppercase tracking-widest text-xs">No API providers connected</div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 relative z-10"
          >
            <h2 className="text-3xl font-display font-black text-gray-900 tracking-tighter mb-10">
              {editingProvider ? 'Edit Provider' : 'Add Provider'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Provider Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold placeholder-gray-400"
                  placeholder="e.g. JustAnotherPanel"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">API URL</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold placeholder-gray-400"
                  placeholder="https://provider.com/api/v2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">API Key</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                      <FontAwesomeIcon icon={faKey} />
                    </div>
                    <input
                      type="password"
                      required
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full pl-12 pr-5 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold placeholder-gray-400"
                      placeholder="••••••••••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-2 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {editingProvider ? 'Update' : 'Connect'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
