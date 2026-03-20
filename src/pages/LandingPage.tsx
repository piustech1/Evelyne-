import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faShieldAlt, faTag, faChartLine, faCheckCircle, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { platformTextColors } from '../utils/platformData';
import WhatsAppCommunity from '../components/WhatsAppCommunity';
import { PlatformIcon } from '../components/PlatformIcon';

const platformsList = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'twitter', name: 'X (Twitter)' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'soundcloud', name: 'SoundCloud' },
  { id: 'twitch', name: 'Twitch' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'kick', name: 'Kick' },
  { id: 'clubhouse', name: 'Clubhouse' },
  { id: 'google play', name: 'Google Play' },
  { id: 'deezer', name: 'Deezer' },
  { id: 'vimeo', name: 'Vimeo' },
  { id: 'website traffic', name: 'Website Traffic' },
  { id: 'coinmarketcap', name: 'CoinMarket' },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-6 pb-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0ZT-7ilfuGZz_lfZpOpilGcueBfIDMPGcElV6kQh8pQ&s=10"
            alt="Social Media Growth"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-purple-900/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-6"
          >
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-inner">
                <FontAwesomeIcon icon={faBolt} className="animate-pulse text-brand-accent" />
                <span>The #1 SMM Panel in Uganda</span>
              </div>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-inner">
                <FontAwesomeIcon icon={faShieldAlt} className="text-emerald-400" />
                <span>Non-Drop Services • Monitored Daily</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-black text-white leading-[1.1] tracking-tighter">
              Grow Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Social</span> <br /> Presence Fast
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-xl font-medium leading-relaxed">
              Premium services for Instagram, TikTok, and YouTube. Get real engagement and dominate your niche today with Uganda's most trusted panel.
            </p>
            <div className="flex flex-row items-center gap-3 pt-4">
              <Link
                to="/signup"
                className="flex-1 sm:flex-none px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/40 hover:scale-105 transition-transform text-sm sm:text-lg uppercase tracking-widest text-center"
              >
                Get Started
              </Link>
              <Link
                to="/services"
                className="flex-1 sm:flex-none px-6 sm:px-10 py-4 sm:py-5 bg-white/10 backdrop-blur-md border border-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all text-sm sm:text-lg uppercase tracking-widest text-center"
              >
                Services
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Curved Separator */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-20">
          <svg className="relative block w-full h-[60px] md:h-[100px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-white opacity-50"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-12 bg-gray-50/50 relative z-30">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-[10px] font-black text-brand-purple uppercase tracking-[0.3em]">Supported Platforms</h2>
            <p className="text-2xl md:text-4xl font-display font-black text-brand-dark tracking-tighter">We Boost Everything</p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4 md:gap-8">
            {platformsList.map((platform, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
              >
                <Link
                  to={`/platform?platform=${platform.name}`}
                  className="group flex flex-col items-center space-y-2"
                >
                  <div className={`w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-xl md:text-2xl ${platformTextColors[platform.id] || 'text-gray-500'} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:-translate-y-1 active-press`}>
                    <PlatformIcon platform={platform.id} imgClassName="w-8 h-8 md:w-10 md:h-10 object-contain" />
                  </div>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest group-hover:text-brand-purple transition-colors text-center truncate w-full px-1">{platform.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-[3rem] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/30">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
            
            <div className="relative z-10 space-y-6 md:space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter">Ready to Boost <br /> Your Growth?</h2>
              <p className="text-white/80 text-lg md:text-xl max-w-xl mx-auto font-medium">
                Join 50,000+ users who are already using EasyBoost to grow their social media presence and dominate their niche.
              </p>
              <Link
                to="/signup"
                className="inline-block px-10 py-4 md:px-14 md:py-5 bg-white text-blue-600 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform text-lg md:text-xl uppercase tracking-widest"
              >
                Start Boosting
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-[10px] md:text-sm font-bold text-white/60 uppercase tracking-widest pt-4">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-white/80" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-white/80" />
                  <span>Instant Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-white/80" />
                  <button 
                    onClick={() => window.open('https://wa.me/256709728322?text=Hello%20EasyBoost%20Support,%20I%20have%20a%20question.', '_blank')}
                    className="hover:text-brand-accent transition-colors"
                  >
                    24/7 Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Community Section */}
      <section className="py-12 bg-gray-50/30 relative z-30">
        <div className="max-w-4xl mx-auto px-6">
          <WhatsAppCommunity />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
            &copy; {new Date().getFullYear()} EasyBoost. All rights reserved.
          </p>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">
            Powered by Pius Tech
          </p>
        </div>
      </footer>
    </div>
  );
}
