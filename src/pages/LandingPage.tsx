import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faShieldAlt, faTag, faChartLine, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faTiktok, faYoutube, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const platforms = [
  {
    icon: faInstagram,
    name: 'Instagram',
    price: 'UGX 2,500',
    desc: 'Followers, Likes, Views & more.',
    color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
  },
  {
    icon: faTiktok,
    name: 'TikTok',
    price: 'UGX 1,500',
    desc: 'Boost your TikTok presence instantly.',
    color: 'bg-black',
  },
  {
    icon: faYoutube,
    name: 'YouTube',
    price: 'UGX 8,000',
    desc: 'High retention views and subs.',
    color: 'bg-[#FF0000]',
  },
  {
    icon: faFacebook,
    name: 'Facebook',
    price: 'UGX 5,000',
    desc: 'Page and post engagement tools.',
    color: 'bg-[#1877F2]',
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-20 pb-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1920"
            alt="Social Media Growth"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/95 via-brand-dark/80 to-brand-dark/95" />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/20 to-transparent opacity-40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-brand-orange text-xs font-bold uppercase tracking-widest shadow-inner">
              <FontAwesomeIcon icon={faBolt} className="animate-pulse" />
              <span>The #1 SMM Panel in Uganda</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-bold text-white leading-[1.1] tracking-tight">
              Grow Your <span className="text-brand-orange">Social</span> <br className="hidden md:block" /> Presence Fast
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
              Premium services for Instagram, TikTok, and YouTube. Get real engagement and dominate your niche today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-10 py-5 gradient-brand text-white font-bold rounded-2xl shadow-2xl shadow-brand-orange/40 hover:scale-105 transition-transform text-lg"
              >
                Get Started Now
              </Link>
              <a
                href="#services"
                className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-lg"
              >
                Explore Services
              </a>
            </div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-20">
          <svg className="relative block w-full h-[60px] md:h-[120px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.47,105.1,123.61,105.54,182.21,95.83,240.81,86.12,282.41,71.94,321.39,56.44Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white relative z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            >
              Our Platforms
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-brand-dark mb-6 tracking-tight">Supported Platforms</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
              We provide high-quality engagement for all major social media platforms with instant delivery and permanent results.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {platforms.map((platform, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-brand-light p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl hover:shadow-brand-orange/10 transition-all border border-transparent hover:border-brand-orange/10 relative overflow-hidden"
              >
                <div className={`w-14 h-14 md:w-20 md:h-20 ${platform.color} rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 text-white text-2xl md:text-3xl shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <FontAwesomeIcon icon={platform.icon} />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-brand-dark mb-1 md:mb-2">{platform.name}</h3>
                <div className="text-brand-orange font-bold text-xs md:text-base mb-3 md:mb-4">
                  Starting {platform.price}
                </div>
                <p className="text-gray-500 text-[10px] md:text-sm mb-6 md:mb-8 line-clamp-2 md:line-clamp-none">{platform.desc}</p>
                <Link
                  to="/signup"
                  className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-white text-brand-dark text-xs md:text-base font-bold border border-gray-100 group-hover:bg-brand-orange group-hover:text-white group-hover:border-brand-orange transition-all shadow-sm"
                >
                  Order Now
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full bg-brand-light -z-10" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="gradient-brand rounded-[3rem] md:rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-brand-orange/30">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
            
            <div className="relative z-10 space-y-8 md:space-y-10">
              <h2 className="text-4xl md:text-7xl font-bold leading-tight tracking-tight">Ready to Boost <br className="hidden md:block" /> Your Growth?</h2>
              <p className="text-white/80 text-lg md:text-xl max-w-xl mx-auto font-medium">
                Join 50,000+ users who are already using EasyBoost to grow their social media presence and dominate their niche.
              </p>
              <Link
                to="/signup"
                className="inline-block px-12 py-5 md:px-16 md:py-6 bg-white text-brand-orange font-bold rounded-2xl md:rounded-full shadow-xl hover:scale-105 transition-transform text-xl md:text-2xl"
              >
                Start Boosting Today
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-[10px] md:text-sm font-bold text-white/60 uppercase tracking-widest pt-4">
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
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
