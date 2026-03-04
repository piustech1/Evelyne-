import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok, faInstagram, faYoutube, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faRocket, faChevronRight, faShieldAlt, faBolt, faCheckCircle, faSearch, faList, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, onValue, get, set, update } from 'firebase/database';

const platformIcons: Record<string, any> = {
  tiktok: faTiktok,
  instagram: faInstagram,
  youtube: faYoutube,
  facebook: faFacebook,
};

const platformColors: Record<string, string> = {
  tiktok: 'bg-white/10 text-white',
  instagram: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
  youtube: 'bg-[#FF0000] text-white',
  facebook: 'bg-[#1877F2] text-white',
};

export default function Services() {
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const categoriesRef = ref(db, 'categories');
    const servicesRef = ref(db, 'services');

    // 1. Listen for Categories
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCategories(Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...value })));
      } else {
        setCategories([]);
      }
    });

    // 2. Listen for Services
    onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setServices(Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...value })));
      } else {
        setServices([]);
      }
      setIsLoading(false);
    });

    // 3. Auto-Fetch from API
    const autoSync = async () => {
      try {
        // Get Settings
        const settingsSnap = await get(ref(db, 'settings'));
        const profit = settingsSnap.val()?.profitPercentage || 20;

        // Get Categories for mapping
        const catsSnap = await get(ref(db, 'categories'));
        const catsData = catsSnap.val() || {};
        const catsList = Object.entries(catsData).map(([id, val]: [string, any]) => ({ id, ...val }));

        // Fetch from API
        const response = await fetch('/api/smm/services', { method: 'POST' });
        const text = await response.text();
        
        if (!text || (!text.startsWith("[") && !text.startsWith("{"))) {
          throw new Error("Failed to load services");
        }

        const apiServices = JSON.parse(text);
        
        if (apiServices.error) {
          throw new Error(apiServices.error);
        }

        if (!Array.isArray(apiServices)) throw new Error("Invalid format");

        const servicesUpdates: any = {};
        apiServices.forEach((s: any) => {
          const rate = parseFloat(s.rate);
          const finalPrice = rate + (rate * profit / 100);
          
          // Automatic Category Mapping
          let matchedCatId = '';
          let matchedCatName = 'Other';
          
          for (const cat of catsList) {
            const keywords = (cat.keywords || '').split(',').map((k: string) => k.trim().toLowerCase());
            const sName = s.name.toLowerCase();
            const sCat = s.category.toLowerCase();
            if (keywords.some(k => k && (sName.includes(k) || sCat.includes(k)))) {
              matchedCatId = cat.id;
              matchedCatName = cat.name;
              break;
            }
          }

          servicesUpdates[s.service] = {
            service: s.service,
            apiServiceId: s.service,
            name: s.name,
            type: s.type,
            category: matchedCatName,
            categoryId: matchedCatId,
            rate: rate,
            price: finalPrice,
            min: parseInt(s.min),
            max: parseInt(s.max),
            refill: s.refill,
            cancel: s.cancel,
            status: 'Active',
            updatedAt: new Date().toISOString()
          };
        });

        await set(ref(db, 'services'), servicesUpdates);
      } catch (err: any) {
        console.error("Auto-sync failed:", err);
        setError("Failed to fetch latest services. Try again later.");
      }
    };

    autoSync();
  }, []);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-dark pb-32">
      {/* Header */}
      <div className="gradient-brand pt-16 pb-24 px-6 text-white text-center rounded-b-[3.5rem] shadow-2xl shadow-brand-blue/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] mb-6 shadow-inner border border-white/20">
            <FontAwesomeIcon icon={faRocket} className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black mb-3 tracking-tighter">Our Services</h1>
          <p className="text-white/70 max-w-md mx-auto font-medium text-sm md:text-base leading-relaxed">
            Explore our premium boosting services and start growing your social presence today.
          </p>
          {error && (
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              {error}
            </div>
          )}
        </motion.div>
      </div>

      {/* Platforms Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/services/${category.id}`}
                className="group block bg-brand-card rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/5 hover:border-brand-purple/30 h-full relative overflow-hidden"
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${platformColors[category.id.toLowerCase()] || 'bg-brand-purple'} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity`} />
                <div className="flex flex-col h-full">
                  <div className={`w-16 h-16 ${platformColors[category.id.toLowerCase()] || 'bg-brand-purple text-white'} rounded-2xl flex items-center justify-center text-2xl mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 border border-white/10`}>
                    <FontAwesomeIcon icon={platformIcons[category.id.toLowerCase()] || faRocket} />
                  </div>
                  <h3 className="text-2xl font-display font-black text-white mb-3 group-hover:text-brand-purple transition-colors tracking-tighter">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-8 flex-grow font-medium leading-relaxed">
                    {category.description || `Premium ${category.name} services to boost your reach.`}
                  </p>
                  <div className="flex items-center text-brand-purple font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                    <span>Explore Services</span>
                    <FontAwesomeIcon icon={faChevronRight} className="ml-2 text-[8px]" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Full Services List */}
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter">Full Services List</h2>
              <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mt-2">Browse all available services across all platforms</p>
            </div>
            <div className="relative group w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-600 group-focus-within:text-brand-purple transition-colors">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <input
                type="text"
                placeholder="Search all services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-6 py-4 bg-brand-card border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all w-full font-bold text-sm shadow-xl"
              />
            </div>
          </div>

          <div className="bg-brand-card rounded-[3.5rem] shadow-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">ID</th>
                    <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Service</th>
                    <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</th>
                    <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Price / 1k</th>
                    <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Min/Max</th>
                    <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredServices.map((service, idx) => (
                    <motion.tr
                      key={service.apiServiceId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.01 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-10 py-8 text-xs font-black text-white group-hover:text-brand-purple transition-colors">#{service.apiServiceId}</td>
                      <td className="px-10 py-8 text-xs font-bold text-gray-400">{service.name}</td>
                      <td className="px-10 py-8 text-xs font-bold text-gray-600">{service.category}</td>
                      <td className="px-10 py-8 text-xs font-black text-brand-purple">UGX {service.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">{service.min?.toLocaleString()} / {service.max?.toLocaleString()}</td>
                      <td className="px-10 py-8 text-right">
                        <Link
                          to={service.categoryId ? `/services/${service.categoryId}` : '#'}
                          className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            service.categoryId 
                            ? 'gradient-brand text-white shadow-lg shadow-brand-blue/20 hover:scale-105' 
                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          Boost
                        </Link>
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
      </div>

      {/* Info Section */}
      <div className="max-w-5xl mx-auto px-6 mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-card rounded-[3.5rem] p-10 md:p-16 shadow-2xl border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
          
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter">Why Choose EasyBoost?</h2>
            <div className="w-16 h-1.5 gradient-brand mx-auto mt-4 rounded-full shadow-lg shadow-brand-blue/20" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform shadow-inner border border-brand-blue/10">
                <FontAwesomeIcon icon={faRocket} className="text-2xl" />
              </div>
              <h3 className="font-black text-white text-lg mb-2 tracking-tight">Fast Delivery</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">Orders processed within minutes of payment confirmation.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
              <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple mb-6 group-hover:scale-110 transition-transform shadow-inner border border-brand-purple/10">
                <FontAwesomeIcon icon={faShieldAlt} className="text-2xl" />
              </div>
              <h3 className="font-black text-white text-lg mb-2 tracking-tight">Secure Payments</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">Encrypted transactions, your security is our top priority.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform shadow-inner border border-emerald-500/10">
                <FontAwesomeIcon icon={faBolt} className="text-2xl" />
              </div>
              <h3 className="font-black text-white text-lg mb-2 tracking-tight">24/7 Support</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">Our expert team is always here to help you grow your reach.</p>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-6 md:gap-12">
            <div className="flex items-center space-x-2 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">
              <FontAwesomeIcon icon={faCheckCircle} className="text-brand-purple" />
              <span>Real Engagement</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">
              <FontAwesomeIcon icon={faCheckCircle} className="text-brand-purple" />
              <span>No Password Required</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">
              <FontAwesomeIcon icon={faCheckCircle} className="text-brand-purple" />
              <span>Money Back Guarantee</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
