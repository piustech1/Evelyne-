import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok, faInstagram, faYoutube, faFacebook, faTwitter, faTelegram, faSpotify, faLinkedin, faSnapchat } from '@fortawesome/free-brands-svg-icons';
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
  other: 'bg-gray-500 text-white'
};

const detectPlatform = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('tiktok')) return 'TikTok';
  if (n.includes('instagram')) return 'Instagram';
  if (n.includes('youtube')) return 'YouTube';
  if (n.includes('facebook')) return 'Facebook';
  if (n.includes('twitter') || n.includes(' x ') || n.includes(' x-')) return 'Twitter';
  if (n.includes('telegram')) return 'Telegram';
  if (n.includes('spotify')) return 'Spotify';
  if (n.includes('linkedin')) return 'LinkedIn';
  if (n.includes('snapchat')) return 'Snapchat';
  return 'Other';
};

const ServiceSkeleton = () => (
  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse space-y-4">
    <div className="flex justify-between items-start gap-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="grid grid-cols-2 gap-3 pt-2">
      <div className="space-y-2">
        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-gray-200 rounded w-1/2 ml-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
    <div className="h-10 bg-gray-200 rounded-xl w-full mt-4"></div>
  </div>
);

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
    navigate(`/boost?service=${service.apiServiceId}`);
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
          {error && (
            <div className="mt-4 inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-yellow-400" />
              {error}
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
          {isLoading ? (
            <div className="space-y-12">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-6">
                  <div className="flex items-center space-x-4 px-2">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse"></div>
                    <div className="h-6 bg-gray-100 rounded w-48 animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((j) => <ServiceSkeleton key={j} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : Object.entries(groupedServices).sort().map(([categoryName, categoryServices]: [string, any[]]) => (
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
                    className="bg-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
                  >
                    <div className="flex-grow space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-brand-light leading-snug group-hover:text-brand-purple transition-colors line-clamp-2">
                          {service.name}
                        </h4>
                        <span className="text-[8px] font-black px-2 py-1 bg-white text-gray-400 rounded-md uppercase tracking-tighter border border-gray-100 whitespace-nowrap">
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
                      className="mt-5 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
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
                {error && services.length === 0 ? 'Services unavailable' : 'No services found'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
