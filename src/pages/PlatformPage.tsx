import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faGlobe, faSearch, faList, faStar
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { fetchServices, Service } from '../lib/servicesStore';
import { platformColors } from '../utils/platformData';
import { ServiceCard, ServiceCardSkeleton } from '../components/ServiceCard';
import { PlatformIcon } from '../components/PlatformIcon';

const RecentlyUsedSection = ({ platform }: { platform: string }) => {
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const recentlyUsed = JSON.parse(localStorage.getItem('easyboost_recently_used') || '[]');
    const platformServices = recentlyUsed.filter((s: any) => s.category.toLowerCase() === platform.toLowerCase());
    setServices(platformServices);
  }, [platform]);

  if (services.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-brand-purple uppercase tracking-[0.3em]">Quick Re-order</h3>
          <p className="text-xl font-display font-black text-brand-dark tracking-tighter">Recently Used</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, idx) => (
          <ServiceCard 
            key={service.service} 
            service={service} 
            onBoost={() => navigate(`/order?service=${service.apiServiceId || service.service}`)}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
};

const FavoritesSection = ({ platform }: { platform: string }) => {
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('easyboost_favorites') || '[]');
    const platformServices = favorites.filter((s: any) => s.category.toLowerCase() === platform.toLowerCase());
    setServices(platformServices);
  }, [platform]);

  if (services.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Your Top Picks</h3>
          <p className="text-xl font-display font-black text-brand-dark tracking-tighter">Favorites</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, idx) => (
          <ServiceCard 
            key={service.service} 
            service={service} 
            onBoost={() => navigate(`/order?service=${service.apiServiceId || service.service}`)}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
};

export default function PlatformPage() {
  const [searchParams] = useSearchParams();
  const platform = searchParams.get('platform') || 'Others';
  const navigate = useNavigate();
  
  const [services, setServices] = useState<Service[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dynamicFilters, setDynamicFilters] = useState<string[]>(['All']);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allServices = await fetchServices();
        let filtered = allServices.filter(s => s.category.toLowerCase() === platform.toLowerCase());
        
        // Fallback for WhatsApp (Task 1)
        if (platform.toLowerCase() === 'whatsapp' && filtered.length === 0) {
          filtered = allServices.filter(s => {
            const n = s.name.toLowerCase();
            return n.includes('group') || n.includes('members') || n.includes('channel');
          });
        }
        setServices(filtered);
        
        // Manual filter mapping (Task 5)
        const manualFilters: Record<string, string[]> = {
          'tiktok': ['Followers', 'Likes', 'Views', 'Live', 'Comments', 'Shares'],
          'instagram': ['Followers', 'Reels', 'Story', 'Likes', 'Comments'],
          'youtube': ['Subscribers', 'Views', 'Likes'],
          'telegram': ['Members', 'Views', 'Reactions'],
          'whatsapp': ['Group Members', 'Channel Members']
        };

        const platformKey = platform.toLowerCase();
        let filters = ['All'];

        if (manualFilters[platformKey]) {
          filters = ['All', ...manualFilters[platformKey]];
        } else {
          // Extract unique sub-categories for filters
          const subs = Array.from(new Set(filtered.map(s => s.sub_category || 'General'))).sort();
          filters = ['All', ...subs];
        }
        
        setDynamicFilters(filters);

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
    
    // Manual filter matching logic
    const n = s.name.toLowerCase();
    const f = activeFilter.toLowerCase();
    
    if (f === 'followers') return matchesSearch && n.includes('follower');
    if (f === 'likes') return matchesSearch && n.includes('like');
    if (f === 'views') return matchesSearch && n.includes('view');
    if (f === 'live') return matchesSearch && n.includes('live');
    if (f === 'comments') return matchesSearch && n.includes('comment');
    if (f === 'shares') return matchesSearch && n.includes('share');
    if (f === 'reels') return matchesSearch && n.includes('reel');
    if (f === 'story') return matchesSearch && n.includes('story');
    if (f === 'subscribers') return matchesSearch && n.includes('subscriber');
    if (f === 'members') return matchesSearch && n.includes('member');
    if (f === 'reactions') return matchesSearch && n.includes('reaction');
    if (f === 'group members') return matchesSearch && n.includes('group');
    if (f === 'channel members') return matchesSearch && n.includes('channel');

    return matchesSearch && (s.sub_category === activeFilter);
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
            {dynamicFilters.map((f) => (
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

        {/* Recently Used & Favorites (Task 7) */}
        {(activeFilter === 'All' && !searchTerm) && (
          <div className="space-y-12 mb-12">
            <RecentlyUsedSection platform={platform} />
            <FavoritesSection platform={platform} />
          </div>
        )}

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
                    {isLoading ? "⚠️ Services loading or temporarily unavailable" : "No services found for this filter"}
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
