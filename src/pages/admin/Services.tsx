import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faSearch, faFilter, faList, faToggleOn, faToggleOff, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, set, update, get } from 'firebase/database';

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleSyncServices = async () => {
    setIsSyncing(true);
    try {
      // 1. Get Profit Percentage
      const settingsRef = ref(db, 'settings');
      const settingsSnap = await get(settingsRef);
      const settings = settingsSnap.val() || { profitPercentage: 20 };
      const profit = settings.profitPercentage || 20;

      // 2. Get Categories for matching
      const categoriesRef = ref(db, 'categories');
      const categoriesSnap = await get(categoriesRef);
      const categoriesData = categoriesSnap.val() || {};
      const categoriesList = Object.entries(categoriesData).map(([id, val]: [string, any]) => ({ id, ...val }));

      // 3. Fetch from API
      const response = await fetch('/api/smm/services', { method: 'POST' });
      const apiServices = await response.json();

      if (!Array.isArray(apiServices)) {
        throw new Error('Invalid API response');
      }

      // 4. Process and Save
      const servicesRef = ref(db, 'services');
      const updates: any = {};

      apiServices.forEach((apiService: any) => {
        const rate = parseFloat(apiService.rate);
        const finalPrice = rate + (rate * profit / 100);
        
        // Match category
        let matchedCategoryId = '';
        let matchedCategoryName = 'Uncategorized';

        for (const cat of categoriesList) {
          const keywords = (cat.keywords || '').split(',').map((k: string) => k.trim().toLowerCase());
          const serviceName = apiService.name.toLowerCase();
          const apiCategory = apiService.category.toLowerCase();

          if (keywords.some(k => k && (serviceName.includes(k) || apiCategory.includes(k)))) {
            matchedCategoryId = cat.id;
            matchedCategoryName = cat.name;
            break;
          }
        }

        updates[apiService.service] = {
          apiServiceId: apiService.service,
          name: apiService.name,
          originalCategory: apiService.category,
          categoryId: matchedCategoryId,
          categoryName: matchedCategoryName,
          originalRate: rate,
          price: finalPrice,
          min: parseInt(apiService.min),
          max: parseInt(apiService.max),
          type: apiService.type,
          status: 'Active',
          updatedAt: new Date().toISOString()
        };
      });

      await set(servicesRef, updates);
      alert(`Successfully synced ${apiServices.length} services!`);
    } catch (err: any) {
      console.error('Sync Error:', err);
      alert('Failed to sync services: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleStatus = async (service: any) => {
    const newStatus = service.status === 'Active' ? 'Disabled' : 'Active';
    try {
      await update(ref(db, `services/${service.apiServiceId}`), { status: newStatus });
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
          onClick={handleSyncServices}
          disabled={isSyncing}
          className="px-8 py-4 gradient-brand text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-brand-blue/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faCloudDownloadAlt} className={isSyncing ? 'animate-bounce' : ''} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Services from API'}</span>
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
                <th className="pb-6 px-4">API ID</th>
                <th className="pb-6 px-4">Service Name</th>
                <th className="pb-6 px-4 hidden sm:table-cell">Category</th>
                <th className="pb-6 px-4">Price / 1k</th>
                <th className="pb-6 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredServices.map((service, idx) => (
                <motion.tr
                  key={service.apiServiceId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-white/5 transition-colors"
                >
                  <td className="py-6 px-4 text-xs font-black text-white">#{service.apiServiceId}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-400 truncate max-w-[300px]">{service.name}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-600 hidden sm:table-cell">{service.categoryName}</td>
                  <td className="py-6 px-4 text-xs font-black text-brand-purple">UGX {service.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
    </div>
  );
}
