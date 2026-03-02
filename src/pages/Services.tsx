import { motion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok, faInstagram, faYoutube, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faRocket, faChevronRight, faShieldAlt, faBolt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const platforms = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: faTiktok,
    color: 'bg-black',
    description: 'Boost your TikTok presence with likes, views, and followers.',
    path: '/services/tiktok'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: faInstagram,
    color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
    description: 'Grow your Instagram account with real engagement and reach.',
    path: '/services/instagram'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: faYoutube,
    color: 'bg-[#FF0000]',
    description: 'Increase your YouTube subscribers, watch time, and views.',
    path: '/services/youtube'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: faFacebook,
    color: 'bg-[#1877F2]',
    description: 'Enhance your Facebook page likes, followers, and post reach.',
    path: '/services/facebook'
  }
];

export default function Services() {
  return (
    <div className="min-h-screen bg-brand-light pb-32">
      {/* Header */}
      <div className="gradient-brand pt-12 pb-20 px-6 text-white text-center rounded-b-[3rem] shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-4 shadow-inner">
            <FontAwesomeIcon icon={faRocket} className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Services</h1>
          <p className="text-white/80 max-w-md mx-auto">
            Select a platform to explore our premium boosting services.
          </p>
        </motion.div>
      </div>

      {/* Platforms Grid */}
      <div className="max-w-6xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={platform.path}
                className="group block bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${platform.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                
                <div className="flex flex-col h-full">
                  <div className={`w-14 h-14 ${platform.color} rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <FontAwesomeIcon icon={platform.icon} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-orange transition-colors">
                    {platform.name}
                  </h3>
                  
                  <p className="text-gray-500 text-sm mb-6 flex-grow">
                    {platform.description}
                  </p>
                  
                  <div className="flex items-center text-brand-orange font-bold text-sm group-hover:translate-x-1 transition-transform">
                    <span>Explore Services</span>
                    <FontAwesomeIcon icon={faChevronRight} className="ml-2 text-xs" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="max-w-5xl mx-auto px-6 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Why Choose EasyBoost?</h2>
            <div className="w-12 h-1 gradient-brand mx-auto mt-2 rounded-full opacity-50" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-brand-light/50 transition-colors group">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange mb-3 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faRocket} />
              </div>
              <h3 className="font-bold text-brand-dark text-sm mb-1">Fast Delivery</h3>
              <p className="text-gray-500 text-[11px] leading-tight max-w-[140px]">Orders processed within minutes of payment.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-brand-light/50 transition-colors group">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange mb-3 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h3 className="font-bold text-brand-dark text-sm mb-1">Secure Payments</h3>
              <p className="text-gray-500 text-[11px] leading-tight max-w-[140px]">Encrypted transactions, no passwords needed.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-brand-light/50 transition-colors group col-span-2 md:col-span-1">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange mb-3 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faBolt} />
              </div>
              <h3 className="font-bold text-brand-dark text-sm mb-1">24/7 Support</h3>
              <p className="text-gray-500 text-[11px] leading-tight max-w-[140px]">Our team is always here to help you grow.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
