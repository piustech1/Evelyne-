import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';

export default function GlobalAnnouncement() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="relative z-[1000] h-6 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 shadow-lg flex items-center overflow-hidden"
      >
        {/* Animated Shine Effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 h-full"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        <div className="flex-grow relative flex items-center h-full">
          <div className="whitespace-nowrap animate-marquee flex items-center">
            <span className="text-[9px] font-black text-white uppercase tracking-widest px-4">
              🚀 Super Boost is now fully upgraded! No more drops, better speed & stronger services 💪
            </span>
            <span className="text-[9px] font-black text-white uppercase tracking-widest px-4">
              🚀 Super Boost is now fully upgraded! No more drops, better speed & stronger services 💪
            </span>
            <span className="text-[9px] font-black text-white uppercase tracking-widest px-4">
              🚀 Super Boost is now fully upgraded! No more drops, better speed & stronger services 💪
            </span>
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="relative z-10 w-6 h-6 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
        </button>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
