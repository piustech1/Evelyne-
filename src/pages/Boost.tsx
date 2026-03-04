import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faYoutube, faFacebook, faTelegram, faTwitter, faSpotify, faSnapchat, faLinkedin, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faRocket, faGlobe, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { PLATFORMS } from '../lib/servicesStore';

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
  tiktok: 'bg-black text-white',
  facebook: 'bg-[#1877F2] text-white',
  instagram: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
  youtube: 'bg-[#FF0000] text-white',
  telegram: 'bg-[#0088cc] text-white',
  twitter: 'bg-[#1DA1F2] text-white',
  spotify: 'bg-[#1DB954] text-white',
  snapchat: 'bg-[#FFFC00] text-black',
  linkedin: 'bg-[#0077B5] text-white',
  whatsapp: 'bg-[#25D366] text-white',
  others: 'bg-gray-500 text-white'
};

export default function Boost() {
  const navigate = useNavigate();

  const handlePlatformSelect = (platform: string) => {
    navigate(`/platform?platform=${platform}`);
  };

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
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl shadow-lg border border-white/30">
              <FontAwesomeIcon icon={faRocket} className="animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-tighter">Boost Now</h1>
          </div>
          <p className="text-white/80 max-w-md mx-auto font-medium text-xs uppercase tracking-widest">
            Select a platform to start your growth journey.
          </p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-12">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-[10px] font-black text-brand-purple uppercase tracking-[0.3em]">Step 1</h2>
              <p className="text-xl font-black text-brand-light tracking-tight">Choose Your Platform</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {PLATFORMS.map((p, idx) => (
                <motion.button
                  key={p}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePlatformSelect(p)}
                  className="group flex flex-col items-center p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-brand-purple/20 hover:shadow-xl transition-all relative overflow-hidden"
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-lg mb-4 transition-all group-hover:rotate-6 ${platformColors[p.toLowerCase()] || 'bg-brand-purple text-white'}`}>
                    <FontAwesomeIcon icon={platformIcons[p.toLowerCase()] || faGlobe} />
                  </div>
                  <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest group-hover:text-brand-purple transition-colors">
                    {p}
                  </span>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FontAwesomeIcon icon={faChevronRight} className="text-[8px] text-brand-purple" />
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="pt-8 border-t border-gray-100 text-center">
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                More platforms coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
