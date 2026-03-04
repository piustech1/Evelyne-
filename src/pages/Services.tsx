import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok, faInstagram, faYoutube, faFacebook, faTwitter, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faRocket, faChevronRight, faShieldAlt, faBolt, faCheckCircle, faSearch, faList, faExclamationTriangle, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, onValue, get, set } from 'firebase/database';

const platformIcons: Record<string, any> = {
  tiktok: faTiktok,
  instagram: faInstagram,
  youtube: faYoutube,
  facebook: faFacebook,
  twitter: faTwitter,
  telegram: faTelegram,
  other: faGlobe
};

const platformColors: Record<string, string> = {
  tiktok: 'bg-black text-white',
  instagram: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
  youtube: 'bg-[#FF0000] text-white',
  facebook: 'bg-[#1877F2] text-white',
  twitter: 'bg-[#1DA1F2] text-white',
  telegram: 'bg-[#0088cc] text-white',
  other: 'bg-gray-500 text-white'
};

const detectPlatform = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('tiktok')) return 'TikTok';
  if (n.includes('instagram')) return 'Instagram';
  if (n.includes('youtube')) return 'YouTube';
  if (n.includes('facebook')) return 'Facebook';
  if (n.includes('twitter') || n.includes(' x ')) return 'Twitter';
  if (n.includes('telegram')) return 'Telegram';
  return 'Other';
};

export default function Services() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncFailed, setSyncFailed] = useState(false);

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
        const settingsSnap = await get(ref(db, 'settings'));
        const profit = settingsSnap.val()?.profitPercentage || 20;

        const catsSnap = await get(ref(db, 'categories'));
        const catsData = catsSnap.val() || {};
        const catsList = Object.entries(catsData).map(([id, val]: [string, any]) => ({ id, ...val }));

        const response = await fetch('/api/smm/services', { method: 'POST' });
        const text = await response.text();
        
        if (!text || (!text.startsWith("[") && !text.startsWith("{"))) {
          throw new Error(`Invalid response from server (Status: ${response.status})`);
        }

        const apiServices = JSON.parse(text);
        
        if (apiServices.error) {
          throw new Error(`API Error: ${apiServices.error}`);
        }

        if (!Array.isArray(apiServices)) throw new Error("Invalid format");

        const servicesUpdates: any = {};
        apiServices.forEach((s: any) => {
          const usdRate = parseFloat(s.rate);
          const ugxRate = usdRate * 3800;
          const finalPrice = ugxRate + (ugxRate * profit / 100);
          
          let matchedCatId = '';
          let matchedCatName = detectPlatform(s.name);
          
          // Try to find a matching category in our DB
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

          // If no matchedCatId, we still use the detected platform name for grouping
          if (!matchedCatId) {
            // We could optionally create a category here, but for now we just group by name
            matchedCatId = matchedCatName.toLowerCase();
          }

          servicesUpdates[s.service] = {
            service: s.service,
            apiServiceId: s.service,
            name: s.name,
            type: s.type,
            category: matchedCatName,
            categoryId: matchedCatId,
            rate: usdRate,
            price: Math.round(finalPrice),
            min: parseInt(s.min),
            max: parseInt(s.max),
            refill: s.refill,
            cancel: s.cancel,
            status: 'Active',
            updatedAt: new Date().toISOString()
          };
        });

        await set(ref(db, 'services'), servicesUpdates);
        setSyncFailed(false);
      } catch (err: any) {
        console.error("Auto-sync failed:", err);
        setSyncFailed(true);
      }
    };

    autoSync();
  }, []);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedServices = filteredServices.reduce((acc: Record<string, any[]>, service) => {
    const category = service.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  const handleBoost = (service: any) => {
    navigate(`/services/${service.categoryId}`, { state: { preSelectedService: service } });
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="gradient-brand pt-12 pb-20 px-6 text-white text-center rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <h1 className="text-3xl md:text-4xl font-display font-black mb-2 tracking-tighter">Premium Services</h1>
          <p className="text-white/80 max-w-md mx-auto font-medium text-sm leading-relaxed">
            Boost your social presence with our high-quality services.
          </p>
          {syncFailed && (
            <div className="mt-4 inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-yellow-400" />
              Failed to load latest services
            </div>
          )}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        {/* Search Bar */}
        <div className="relative group w-full max-w-2xl mx-auto mb-12">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
            <FontAwesomeIcon icon={faSearch} />
          </div>
          <input
            type="text"
            placeholder="Search for a service or platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-brand-light placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all w-full font-semibold text-sm shadow-md"
          />
        </div>

        {/* Services by Category */}
        <div className="space-y-16">
          {Object.entries(groupedServices).sort().map(([categoryName, categoryServices]: [string, any[]]) => (
            <div key={categoryName} className="space-y-6">
              <div className="flex items-center space-x-4 px-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${platformColors[categoryName.toLowerCase()] || 'bg-brand-purple text-white'} shadow-sm`}>
                  <FontAwesomeIcon icon={platformIcons[categoryName.toLowerCase()] || faGlobe} />
                </div>
                <h3 className="text-xl font-display font-black text-brand-light tracking-tighter">
                  {categoryName} Services
                </h3>
                <div className="h-px flex-grow bg-gray-100"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{categoryServices.length} Services</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryServices.map((service, idx) => (
                  <motion.div
                    key={service.apiServiceId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
                  >
                    <div className="flex-grow space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-brand-light leading-snug group-hover:text-brand-purple transition-colors line-clamp-2">
                          {service.name}
                        </h4>
                        <span className="text-[8px] font-black px-2 py-1 bg-gray-50 text-gray-400 rounded-md uppercase tracking-tighter whitespace-nowrap">
                          ID: {service.apiServiceId}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Price / 1k</span>
                          <div className="text-sm font-black text-brand-purple">UGX {Math.round(service.price || 0).toLocaleString()}</div>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Min / Max</span>
                          <div className="text-[10px] font-bold text-brand-light">
                            {service.min?.toLocaleString()} / {service.max > 1000000 ? '1M+' : service.max?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBoost(service)}
                      className="mt-5 w-full py-3 gradient-brand text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faRocket} className="text-[8px]" />
                      <span>Boost Now</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {filteredServices.length === 0 && !isLoading && (
            <div className="py-24 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-2xl mx-auto">
                <FontAwesomeIcon icon={faList} />
              </div>
              <div className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                {syncFailed && services.length === 0 ? 'Services unavailable' : 'No services found'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
