import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCheckCircle, faBolt, faFire, faGem } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { fetchServices, Service } from '../lib/servicesStore';
import { ServiceCard, ServiceCardSkeleton } from '../components/ServiceCard';

export default function Recommended() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'guaranteed' | 'trending' | 'value'>('all');

  useEffect(() => {
    const loadServices = async () => {
      try {
        const allServices = await fetchServices();
        // Filter and sort for recommendations
        // Priority: Guaranteed > Trending > Best Value
        const recommended = allServices.filter(s => 
          s.guaranteed || 
          (s.badges && s.badges.length > 0) ||
          s.price < 1000 // Heuristic for best value
        ).sort((a, b) => {
          if (a.guaranteed && !b.guaranteed) return -1;
          if (!a.guaranteed && b.guaranteed) return 1;
          return 0;
        });
        
        setServices(recommended);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadServices();
  }, []);

  const filteredServices = services.filter(s => {
    if (activeTab === 'all') return true;
    if (activeTab === 'guaranteed') return s.guaranteed;
    if (activeTab === 'trending') return s.badges?.includes('trending');
    if (activeTab === 'value') return s.badges?.includes('best_value') || s.price < 1000;
    return true;
  });

  const handleBoost = (service: Service) => {
    navigate(`/order?service=${service.apiServiceId || service.service}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-32">
      {/* Header */}
      <div className="gradient-brand pt-12 pb-24 px-6 text-white text-center rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10 space-y-4"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-xl border border-white/20">
              <FontAwesomeIcon icon={faGem} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tighter">Recommended</h1>
              <p className="mt-2 text-white/80 text-xs uppercase tracking-[0.2em] font-bold">Hand-picked services for maximum impact</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        {/* Filter Tabs */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-2 mb-12 flex overflow-x-auto no-scrollbar gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 min-w-[100px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeTab === 'all' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <FontAwesomeIcon icon={faStar} className="text-[8px]" />
            All Picks
          </button>
          <button
            onClick={() => setActiveTab('guaranteed')}
            className={`flex-1 min-w-[120px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeTab === 'guaranteed' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <FontAwesomeIcon icon={faCheckCircle} className="text-[8px]" />
            Guaranteed
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 min-w-[100px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeTab === 'trending' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <FontAwesomeIcon icon={faFire} className="text-[8px]" />
            Trending
          </button>
          <button
            onClick={() => setActiveTab('value')}
            className={`flex-1 min-w-[100px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeTab === 'value' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <FontAwesomeIcon icon={faBolt} className="text-[8px]" />
            Best Value
          </button>
        </div>

        {/* Services Grid */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => <ServiceCardSkeleton key={j} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredServices.length > 0 ? (
                filteredServices.map((service, idx) => (
                  <ServiceCard 
                    key={service.service} 
                    service={service} 
                    onBoost={handleBoost} 
                  />
                ))
              ) : (
                <div className="col-span-full py-24 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-2xl mx-auto">
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <div className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                    No recommended services found in this category
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
