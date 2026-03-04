import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faYoutube, faFacebook, faTelegram, faTwitter, faSpotify, faSnapchat, faLinkedin, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faShoppingCart, faCheckCircle, faInfoCircle, faRocket, faGlobe, faSearch, faFilter, faList } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { fetchServices, Service } from '../lib/servicesStore';

const platformIcons: Record<string, any> = {
  tiktok: faTiktok,
  facebook: faFacebook,
  instagram: faInstagram,
  youtube: faYoutube,
  telegram: faTelegram,
  twitter: faTwitter,
  spotify: faSpotify,
  snapchat: faSnapchat,
  linkedin: faLinkedin,
  whatsapp: faWhatsapp,
  others: faGlobe
};

const platformColors: Record<string, string> = {
  tiktok: 'text-white bg-black',
  facebook: 'text-white bg-[#1877F2]',
  instagram: 'text-white bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
  youtube: 'text-white bg-[#FF0000]',
  telegram: 'text-white bg-[#0088cc]',
  twitter: 'text-white bg-[#1DA1F2]',
  spotify: 'text-white bg-[#1DB954]',
  snapchat: 'text-black bg-[#FFFC00]',
  linkedin: 'text-white bg-[#0077B5]',
  whatsapp: 'text-white bg-[#25D366]',
  others: 'text-white bg-gray-500',
};

const ServiceSkeleton = () => (
  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-4">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="h-8 bg-gray-200 rounded-lg"></div>
      <div className="h-8 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
  </div>
);

export default function PlatformPage() {
  const [searchParams] = useSearchParams();
  const platform = searchParams.get('platform') || 'Others';
  const navigate = useNavigate();
  
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filters = ['All', 'Followers', 'Likes', 'Views', 'Comments', 'Shares', 'Other'];

  useEffect(() => {
    const loadServices = async () => {
      try {
        const allServices = await fetchServices();
        const filtered = allServices.filter(s => s.category.toLowerCase() === platform.toLowerCase());
        setServices(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadServices();
  }, [platform]);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Other') {
      const knownFilters = ['Followers', 'Likes', 'Views', 'Comments', 'Shares'];
      return matchesSearch && !knownFilters.some(f => s.name.toLowerCase().includes(f.toLowerCase()));
    }
    return matchesSearch && s.name.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const handleBoost = (service: Service) => {
    navigate(`/order?service=${service.apiServiceId}`);
  };

  const shortenName = (name: string) => {
    if (name.length > 45) return name.substring(0, 42) + '...';
    return name;
  };

  const icon = platformIcons[platform.toLowerCase()] || faRocket;
  const colorClass = platformColors[platform.toLowerCase()] || 'bg-brand-purple text-white';

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Curved Header */}
      <div className="gradient-brand pt-12 pb-24 px-6 text-white text-center rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10 space-y-4"
        >
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center text-xl shadow-lg border-2 border-white/20`}>
              <FontAwesomeIcon icon={icon} />
            </div>
            <h1 className="text-2xl md:text-4xl font-display font-black tracking-tighter">{platform} Services</h1>
          </div>
          <p className="text-white/80 max-w-md mx-auto font-medium text-xs uppercase tracking-widest">
            Boost your {platform} presence with our premium tools.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        {/* Search and Filters */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-6 md:p-8 mb-12 space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <input
              type="text"
              placeholder={`Search ${platform} services...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all w-full font-bold text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === f 
                  ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Available Services</h2>
            <span className="text-[9px] font-black text-brand-purple bg-brand-purple/5 px-2 py-1 rounded-full uppercase tracking-widest">{filteredServices.length} Options</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => <ServiceSkeleton key={j} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredServices.length > 0 ? (
                filteredServices.map((service, idx) => (
                  <motion.div
                    key={service.apiServiceId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.02 }}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
                  >
                    <div className="flex-grow space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm shadow-sm ${colorClass}`}>
                          <FontAwesomeIcon icon={icon} />
                        </div>
                        <h4 className="text-[11px] font-black text-gray-900 leading-tight group-hover:text-brand-purple transition-colors">
                          {shortenName(service.name)}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <span className="block text-[7px] font-black text-gray-400 uppercase tracking-widest">Price / 1k</span>
                          <div className="text-[10px] font-black text-brand-purple">UGX {Math.round(service.price || 0).toLocaleString()}</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-right">
                          <span className="block text-[7px] font-black text-gray-400 uppercase tracking-widest">Min / Max</span>
                          <div className="text-[9px] font-bold text-gray-900">
                            {service.min?.toLocaleString()} / {service.max > 1000000 ? '1M+' : service.max?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBoost(service)}
                      className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-md hover:shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faRocket} className="text-[8px]" />
                      <span>Boost Now</span>
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-2xl mx-auto">
                    <FontAwesomeIcon icon={faList} />
                  </div>
                  <div className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                    No services found for this filter
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
