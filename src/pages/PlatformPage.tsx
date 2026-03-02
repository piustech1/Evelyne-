import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faYoutube, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faShoppingCart, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';

const platformData: Record<string, any> = {
  instagram: {
    name: 'Instagram',
    icon: faInstagram,
    color: 'text-[#E1306C]',
    bg: 'bg-[#E1306C]/10',
    services: [
      { id: 'ig-1', name: 'Followers [Real]', price: 2500, desc: 'High quality real followers' },
      { id: 'ig-2', name: 'Likes [Instant]', price: 1200, desc: 'Fast delivery likes' },
      { id: 'ig-3', name: 'Comments [Custom]', price: 5000, desc: 'Random or custom comments' },
      { id: 'ig-4', name: 'Views [Reels]', price: 800, desc: 'Boost your reels reach' },
    ]
  },
  tiktok: {
    name: 'TikTok',
    icon: faTiktok,
    color: 'text-black',
    bg: 'bg-gray-100',
    services: [
      { id: 'tk-1', name: 'Followers', price: 3000, desc: 'Active TikTok followers' },
      { id: 'tk-2', name: 'Likes', price: 1500, desc: 'High quality likes' },
      { id: 'tk-3', name: 'Views', price: 500, desc: 'Instant views for videos' },
      { id: 'tk-4', name: 'Shares', price: 2000, desc: 'Boost your video virality' },
    ]
  },
  youtube: {
    name: 'YouTube',
    icon: faYoutube,
    color: 'text-[#FF0000]',
    bg: 'bg-[#FF0000]/10',
    services: [
      { id: 'yt-1', name: 'Subscribers', price: 15000, desc: 'Non-drop subscribers' },
      { id: 'yt-2', name: 'Views [High Retention]', price: 8000, desc: 'Boost watch time' },
      { id: 'yt-3', name: 'Likes', price: 4000, desc: 'Real user likes' },
      { id: 'yt-4', name: 'Watch Time', price: 45000, desc: '4000 hours package' },
    ]
  },
  facebook: {
    name: 'Facebook',
    icon: faFacebook,
    color: 'text-[#1877F2]',
    bg: 'bg-[#1877F2]/10',
    services: [
      { id: 'fb-1', name: 'Page Likes', price: 5000, desc: 'Grow your page audience' },
      { id: 'fb-2', name: 'Post Likes', price: 1500, desc: 'Boost post engagement' },
      { id: 'fb-3', name: 'Video Views', price: 2500, desc: 'Monetization views' },
      { id: 'fb-4', name: 'Group Members', price: 8000, desc: 'Targeted group growth' },
    ]
  }
};

export default function PlatformPage() {
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const data = platformData[platform?.toLowerCase() || 'instagram'];
  const [selectedService, setSelectedService] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [link, setLink] = useState('');

  if (!data) return <div className="pt-24 text-center">Platform not found</div>;

  const totalPrice = selectedService ? (selectedService.price * quantity) / 1000 : 0;

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className={`w-20 h-20 ${data.bg} ${data.color} rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-black/5 transform hover:rotate-6 transition-transform`}>
            <FontAwesomeIcon icon={data.icon} />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-brand-dark tracking-tight">{data.name} Services</h1>
            <p className="text-gray-500 font-medium text-lg">Select a service to boost your presence</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-6 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-500 hover:text-brand-orange hover:border-brand-orange transition-all shadow-sm group self-start md:self-auto"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Services List */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-bold text-brand-dark uppercase tracking-widest">Available Services</h2>
            <span className="text-xs font-bold text-gray-400">{data.services.length} Options</span>
          </div>
          
          <div className="space-y-4">
            {data.services.map((service: any) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedService(service)}
                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between group ${
                  selectedService?.id === service.id 
                  ? 'border-brand-orange bg-brand-orange/5 shadow-xl shadow-brand-orange/10' 
                  : 'border-gray-100 bg-white hover:border-brand-orange/20 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center space-x-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    selectedService?.id === service.id ? 'bg-brand-orange text-white' : 'bg-gray-50 text-gray-300 group-hover:bg-brand-orange/10 group-hover:text-brand-orange'
                  }`}>
                    <FontAwesomeIcon icon={faCheckCircle} className={selectedService?.id === service.id ? 'opacity-100' : 'opacity-40'} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-orange transition-colors">{service.name}</h3>
                    <p className="text-sm text-gray-400 font-medium">{service.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-brand-orange">UGX {service.price.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Per 1,000</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order Form */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-24">
            <AnimatePresence mode="wait">
              {!selectedService ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-12 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[450px]"
                >
                  <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center text-brand-orange/30 text-4xl">
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-brand-dark">Select a Service</h3>
                    <p className="text-gray-400 font-medium max-w-[240px] mx-auto">Pick a service from the left to configure your boost order.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-50 space-y-8"
                >
                  <div className="flex items-center space-x-4 pb-6 border-b border-gray-50">
                    <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-brand-orange/20">
                      <FontAwesomeIcon icon={faShoppingCart} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-brand-dark tracking-tight">Configure Order</h2>
                      <p className="text-sm text-brand-orange font-bold">{selectedService.name}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-widest">Target Link / URL</label>
                      <div className="relative group">
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder="https://platform.com/username"
                          className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange focus:bg-white transition-all text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-widest">Order Quantity</label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          placeholder="Min: 100"
                          className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange focus:bg-white transition-all text-lg font-bold"
                        />
                      </div>
                      <div className="flex justify-between px-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Min: 100</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max: 100,000</span>
                      </div>
                    </div>

                    <div className="p-8 bg-brand-light rounded-[2.5rem] border border-brand-orange/10 flex justify-between items-center shadow-inner relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl" />
                      <div className="relative z-10">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</div>
                        <div className="text-3xl font-display font-bold text-brand-orange">UGX {totalPrice.toLocaleString()}</div>
                      </div>
                      <div className="text-right relative z-10">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rate</div>
                        <div className="text-sm font-bold text-brand-dark">UGX {selectedService.price}/1k</div>
                      </div>
                    </div>

                    <button className="w-full py-5 gradient-brand text-white font-bold rounded-2xl shadow-xl shadow-brand-orange/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-xl flex items-center justify-center space-x-3 group">
                      <span>Place Order Now</span>
                      <FontAwesomeIcon icon={faShoppingCart} className="text-sm group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Secure checkout powered by EasyBoost
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
