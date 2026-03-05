import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faBolt, faCheckCircle, faStar, faGlobe, faClock } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { Service } from '../lib/servicesStore';
import { platformIcons, platformColors } from '../utils/platformData';

interface ServiceCardProps {
  service: Service;
  onBoost: (service: Service) => void;
  index?: number;
}

export const ServiceCard = ({ service, onBoost, index = 0 }: ServiceCardProps) => {
  const pKey = service.category.toLowerCase();
  const icon = platformIcons[pKey] || faGlobe;
  const colorClass = platformColors[pKey] || 'bg-brand-purple text-white';

  // Derive some "premium" info
  const isPopular = service.price > 5000 || index % 5 === 0;
  const isFast = service.name.toLowerCase().includes('fast') || service.name.toLowerCase().includes('instant') || index % 3 === 0;
  const isRecommended = index % 7 === 0;

  const getSpeed = () => {
    if (service.name.toLowerCase().includes('instant')) return 'Instant';
    if (service.name.toLowerCase().includes('fast')) return 'Fast';
    if (service.name.toLowerCase().includes('h')) {
      const match = service.name.match(/\d+h/);
      return match ? match[0] : '1-24h';
    }
    return '1-24h';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.02 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden"
    >
      {/* Popularity Tag */}
      <div className="absolute top-3 right-3 flex gap-1">
        {isPopular && (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[7px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
            <FontAwesomeIcon icon={faStar} className="text-[6px]" />
            Popular
          </span>
        )}
        {isRecommended && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[7px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
            <FontAwesomeIcon icon={faCheckCircle} className="text-[6px]" />
            Best
          </span>
        )}
      </div>

      <div className="flex-grow space-y-4">
        <div className="flex items-start space-x-3">
          <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl shadow-md border-2 border-white ${colorClass}`}>
            <FontAwesomeIcon icon={icon} />
          </div>
          <div className="space-y-1 pt-1">
            <div className="text-[8px] font-black text-brand-purple uppercase tracking-[0.2em]">{service.category}</div>
            <h4 className="text-xs font-black text-gray-900 leading-tight group-hover:text-brand-purple transition-colors line-clamp-2">
              {service.name}
            </h4>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="block text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Price / 1k</span>
            <div className="text-xs font-black text-brand-purple">UGX {Math.round(service.price || 0).toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="block text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <FontAwesomeIcon icon={faClock} className="text-[6px]" />
              Speed
            </span>
            <div className="text-xs font-black text-gray-900">{getSpeed()}</div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Min Order</span>
            <span className="text-[10px] font-bold text-gray-900">{service.min?.toLocaleString()}</span>
          </div>
          <div className="w-px h-6 bg-gray-100" />
          <div className="flex flex-col text-right">
            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Max Order</span>
            <span className="text-[10px] font-bold text-gray-900">{service.max > 1000000 ? '1M+' : service.max?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onBoost(service)}
        className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
      >
        <FontAwesomeIcon icon={faRocket} className="text-[9px]" />
        <span>Boost Now</span>
      </button>
    </motion.div>
  );
};

export const ServiceCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm shimmer space-y-4 h-[280px]">
    <div className="flex items-start space-x-3">
      <div className="w-12 h-12 bg-gray-200 rounded-2xl flex-shrink-0"></div>
      <div className="space-y-2 flex-grow pt-1">
        <div className="h-2 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="h-12 bg-gray-200 rounded-xl w-full mt-auto"></div>
  </div>
);
