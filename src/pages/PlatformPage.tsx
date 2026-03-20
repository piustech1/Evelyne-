import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faGlobe, faSearch, faList
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { fetchServices, Service } from '../lib/servicesStore';
import { platformColors } from '../utils/platformData';
import { ServiceCard, ServiceCardSkeleton } from '../components/ServiceCard';
import { PlatformIcon } from '../components/PlatformIcon';

export default function PlatformPage() {
  const [searchParams] = useSearchParams();
  const platform = searchParams.get('platform') || 'Others';
  const navigate = useNavigate();
  
  const [services, setServices] = useState<Service[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  const filters = ['All', 'Followers', 'Likes', 'Views', 'Comments', 'Shares', 'Other'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const allServices = await fetchServices();
        const filtered = allServices.filter(s => s.category.toLowerCase() === platform.toLowerCase());
        setServices(filtered);
        
        const platforms = Array.from(new Set(allServices.map(s => s.category))).sort();
        setAllPlatforms(platforms);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [platform]);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         String(s.service).includes(searchTerm);
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Other') {
      const knownFilters = ['Followers', 'Likes', 'Views', 'Comments', 'Shares'];
      return matchesSearch && !knownFilters.some(f => s.name.toLowerCase().includes(f.toLowerCase()));
    }
    return matchesSearch && s.name.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const handleBoost = (service: Service) => {
    navigate(`/order?service=${service.apiServiceId || service.service}`);
  };

  const colorClass = platformColors[platform.toLowerCase()] || 'bg-brand-purple text-white';

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-32">
      {/* Curved Header - No Back Arrow */}
      <div className="gradient-brand pt-12 pb-24 px-6 text-white text-center rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10 space-y-4"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`w-16 h-16 ${colorClass} rounded-2xl flex items-center justify-center text-3xl shadow-xl border-4 border-white/20`}>
              <PlatformIcon platform={platform} imgClassName="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tighter">{platform}</h1>
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                {services.length} Services Available
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        {/* Platform Slider */}
        <div className="mb-8 overflow-hidden">
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto no-scrollbar gap-4 pb-4 px-2"
          >
            {allPlatforms.map((p) => (
              <button
                key={p}
                onClick={() => navigate(`/platform?platform=${p}`)}
                className={`flex-shrink-0 flex items-center space-x-3 px-6 py-3 rounded-2xl border transition-all active-press ${
                  p.toLowerCase() === platform.toLowerCase()
                  ? 'bg-white border-brand-purple shadow-lg scale-105'
                  : 'bg-white/80 border-gray-100 hover:bg-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${platformColors[p.toLowerCase()] || 'bg-gray-200'}`}>
                  <PlatformIcon platform={p} imgClassName="w-5 h-5 object-contain" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${p.toLowerCase() === platform.toLowerCase() ? 'text-brand-purple' : 'text-gray-400'}`}>
                  {p}
                </span>
              </button>
            ))}
          </div>
        </div>

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

          <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 justify-start md:justify-center items-center">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-shrink-0 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap active-press ${
                  activeFilter === f 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg shadow-blue-600/20' 
                  : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => <ServiceCardSkeleton key={j} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredServices.length > 0 ? (
                filteredServices.map((service, idx) => (
                  <div key={service.apiServiceId}>
                    <ServiceCard 
                      service={service} 
                      onBoost={handleBoost} 
                      index={idx} 
                    />
                  </div>
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
