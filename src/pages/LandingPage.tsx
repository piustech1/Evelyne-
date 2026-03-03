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
    <div className="overflow-x-hidden bg-brand-dark">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 pb-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1920"
            alt="Social Media Growth"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/30 to-brand-purple/20 opacity-60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-8"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-brand-accent text-xs font-bold uppercase tracking-widest shadow-inner">
              <FontAwesomeIcon icon={faBolt} className="animate-pulse" />
              <span>The #1 SMM Panel in Uganda</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-black text-white leading-[1.1] tracking-tighter">
              Grow Your <span className="text-gradient">Social</span> <br /> Presence Fast
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl font-medium leading-relaxed">
              Premium services for Instagram, TikTok, and YouTube. Get real engagement and dominate your niche today with Uganda's most trusted panel.
            </p>
            <div className="flex flex-row items-center gap-3 pt-4">
              <Link
                to="/signup"
                className="flex-1 sm:flex-none px-6 sm:px-10 py-4 sm:py-5 gradient-brand text-white font-black rounded-2xl shadow-2xl shadow-brand-blue/40 hover:scale-105 transition-transform text-sm sm:text-lg uppercase tracking-widest text-center"
              >
                Get Started
              </Link>
              <Link
                to="/services"
                className="flex-1 sm:flex-none px-6 sm:px-10 py-4 sm:py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all text-sm sm:text-lg uppercase tracking-widest text-center"
              >
                Services
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Curved Separator */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-20">
          <svg className="relative block w-full h-[60px] md:h-[100px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-brand-dark opacity-50"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-brand-dark"></path>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 relative z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 bg-brand-blue/10 text-brand-accent rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            >
              Our Platforms
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">Supported Platforms</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
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
                className="bg-brand-card p-6 md:p-10 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white/5 transition-all border border-white/5 hover:border-brand-purple/30 relative overflow-hidden"
              >
                <div className={`w-14 h-14 md:w-20 md:h-20 ${platform.color} rounded-2xl flex items-center justify-center mb-6 md:mb-8 text-white text-2xl md:text-3xl shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <FontAwesomeIcon icon={platform.icon} />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{platform.name}</h3>
                <div className="text-brand-accent font-bold text-xs md:text-base mb-3 md:mb-4">
                  Starting {platform.price}
                </div>
                <p className="text-gray-400 text-[10px] md:text-sm mb-6 md:mb-8 line-clamp-2 md:line-clamp-none">{platform.desc}</p>
                <Link
                  to="/signup"
                  className="w-full py-3 md:py-4 rounded-xl bg-white/5 text-white text-xs md:text-base font-bold border border-white/10 group-hover:gradient-brand group-hover:border-transparent transition-all shadow-sm"
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
        <div className="max-w-7xl mx-auto px-6">
          <div className="gradient-brand rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-brand-blue/30">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
            
            <div className="relative z-10 space-y-8 md:space-y-10">
              <h2 className="text-4xl md:text-7xl font-bold leading-tight tracking-tighter">Ready to Boost <br /> Your Growth?</h2>
              <p className="text-white/80 text-lg md:text-xl max-w-xl mx-auto font-medium">
                Join 50,000+ users who are already using EasyBoost to grow their social media presence and dominate their niche.
              </p>
              <Link
                to="/signup"
                className="inline-block px-12 py-5 md:px-16 md:py-6 bg-white text-brand-blue font-black rounded-2xl shadow-xl hover:scale-105 transition-transform text-xl md:text-2xl uppercase tracking-widest"
              >
                Start Boosting
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
