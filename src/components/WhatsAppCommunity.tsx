import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faHeadset, faUsers } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

interface WhatsAppCommunityProps {
  className?: string;
}

export default function WhatsAppCommunity({ className = "" }: WhatsAppCommunityProps) {
  const groupLink = "https://chat.whatsapp.com/CHnzqBGXg6OLk8gaTdUI3b?mode=gi_t";
  const supportNumber = "256709728322";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-[#25D366]/10 border border-[#25D366]/20 p-6 rounded-3xl shadow-sm relative overflow-hidden group ${className}`}
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#25D366]/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-1/3 hidden md:block">
          <img 
            src="https://picsum.photos/seed/community/400/300" 
            alt="Community" 
            className="rounded-2xl shadow-lg border border-white/20 rotate-2 group-hover:rotate-0 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-grow space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#25D366] text-white rounded-xl flex items-center justify-center shadow-sm border border-white/20">
              <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-base tracking-tighter leading-none">Join our WhatsApp Community</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Updates, support, and offers</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-lg">
            Connect with other users, get instant updates on new services, and access priority support. Join thousands of users growing their presence with Super Boost.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => window.open(groupLink, '_blank')}
              className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white hover:bg-[#128C7E] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active-press"
            >
              <FontAwesomeIcon icon={faUsers} className="text-xs" />
              Join Group
            </button>
            <button 
              onClick={() => window.open(`https://wa.me/${supportNumber}?text=Hello%20Super%20Boost%20Support`, '_blank')}
              className="flex items-center justify-center gap-2 py-3 bg-white text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active-press"
            >
              <FontAwesomeIcon icon={faHeadset} className="text-xs" />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
