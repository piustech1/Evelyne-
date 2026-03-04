import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok, faInstagram, faYoutube, faFacebook, faTwitter, faTelegram, faSpotify, faLinkedin, faSnapchat, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faRocket, faChevronRight, faShieldAlt, faBolt, faCheckCircle, faSearch, faList, faExclamationTriangle, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { fetchServices, Service } from '../lib/servicesStore';

const platformIcons: Record<string, any> = {
  tiktok: faTiktok,
  instagram: faInstagram,
  youtube: faYoutube,
  facebook: faFacebook,
  twitter: faTwitter,
  telegram: faTelegram,
  spotify: faSpotify,
  linkedin: faLinkedin,
  snapchat: faSnapchat,
  whatsapp: faWhatsapp,
  other: faGlobe
};

const platformColors: Record<string, string> = {
  tiktok: 'bg-black text-white',
  instagram: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
  youtube: 'bg-[#FF0000] text-white',
  facebook: 'bg-[#1877F2] text-white',
  twitter: 'bg-[#1DA1F2] text-white',
  telegram: 'bg-[#0088cc] text-white',
  spotify: 'bg-[#1DB954] text-white',
  linkedin: 'bg-[#0077B5] text-white',
  snapchat: 'bg-[#FFFC00] text-black',
  whatsapp: 'bg-[#25D366] text-white',
  other: 'bg-gray-500 text-white'
};

const platformsList = [
  { name: 'TikTok', icon: faTiktok, color: 'text-black' },
  { name: 'Instagram', icon: faInstagram, color: 'text-pink-600' },
  { name: 'YouTube', icon: faYoutube, color: 'text-red-600' },
  { name: 'Facebook', icon: faFacebook, color: 'text-blue-600' },
  { name: 'Telegram', icon: faTelegram, color: 'text-sky-500' },
  { name: 'Twitter', icon: faTwitter, color: 'text-blue-400' },
  { name: 'WhatsApp', icon: faWhatsapp, color: 'text-emerald-500' },
  { name: 'Spotify', icon: faSpotify, color: 'text-emerald-400' },
];

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

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices();
        setServices(data);
      } catch (err) {
        setError('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };
    loadServices();
  }, []);

  // Auto-sliding effect for platforms
  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedServices = filteredServices.reduce((acc: Record<string, Service[]>, service) => {
    const category = service.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  const handleBoost = (service: Service) => {
    navigate(`/order?service=${service.apiServiceId}`);
  };

  const shortenName = (name: string) => {
    if (name.length > 45) return name.substring(0, 42) + '...';
    return name;
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Curved Header */}
      <div className="gradient-brand pt-12 pb-24 px-6 text-white text-center rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <h1 className="text-3xl md:text-5xl font-display font-black mb-2 tracking-tighter">All Services</h1>
          <p className="text-white/80 max-w-md mx-auto font-medium text-xs uppercase tracking-widest">
            Explore our full catalog of premium social boosts.
          </p>
          {error && (
            <div className="mt-4 inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-yellow-400" />
              {error}
            </div>
          )}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        {/* Platform Slider */}
        <div className="mb-8 overflow-hidden">
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto gap-4 pb-4 no-scrollbar scroll-smooth"
          >
            {platformsList.map((platform, idx) => (
              <Link
                key={idx}
                to={`/platform?platform=${platform.name}`}
                className="flex-shrink-0 flex items-center space-x-3 px-6 py-3 bg-white rounded-2xl shadow-md border border-gray-50 hover:scale-105 transition-transform"
              >
                <FontAwesomeIcon icon={platform.icon} className={`text-xl ${platform.color}`} />
                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{platform.name}</span>
              </Link>
            ))}
          </div>
        </div>

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
            className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all w-full font-bold text-sm shadow-lg"
          />
        </div>

        {/* Services by Category */}
        <div className="space-y-16">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => <ServiceSkeleton key={j} />)}
            </div>
          ) : Object.entries(groupedServices).sort().map(([categoryName, categoryServices]: [string, any[]]) => (
            <div key={categoryName} className="space-y-6">
              <div className="flex items-center space-x-4 px-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${platformColors[categoryName.toLowerCase()] || 'bg-brand-purple text-white'} shadow-sm`}>
                  <FontAwesomeIcon icon={platformIcons[categoryName.toLowerCase()] || faGlobe} />
                </div>
                <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter">
                  {categoryName}
                </h3>
                <div className="h-px flex-grow bg-gray-100"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{categoryServices.length} Services</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryServices.map((service, idx) => {
                  const pKey = service.category.toLowerCase();
                  return (
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
                          <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm shadow-sm ${platformColors[pKey] || 'bg-brand-purple text-white'}`}>
                            <FontAwesomeIcon icon={platformIcons[pKey] || faGlobe} />
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
                  );
                })}
              </div>
            </div>
          ))}

          {filteredServices.length === 0 && !isLoading && (
            <div className="py-24 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-2xl mx-auto">
                <FontAwesomeIcon icon={faList} />
              </div>
              <div className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                {error && services.length === 0 ? 'Services unavailable' : 'No services found'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
