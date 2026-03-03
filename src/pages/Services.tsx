import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok, faInstagram, faYoutube, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faRocket, faChevronRight, faShieldAlt, faBolt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

const platformIcons: Record<string, any> = {
  tiktok: faTiktok,
  instagram: faInstagram,
  youtube: faYoutube,
  facebook: faFacebook,
};

const platformColors: Record<string, string> = {
  tiktok: 'bg-white/10 text-white',
  instagram: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
  youtube: 'bg-[#FF0000] text-white',
  facebook: 'bg-[#1877F2] text-white',
};

export default function Services() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const categoriesRef = ref(db, 'categories');
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesArray = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
        setCategories(categoriesArray);
      } else {
        setCategories([]);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark pb-32">
      {/* Header */}
      <div className="gradient-brand pt-16 pb-24 px-6 text-white text-center rounded-b-[3.5rem] shadow-2xl shadow-brand-blue/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] mb-6 shadow-inner border border-white/20">
            <FontAwesomeIcon icon={faRocket} className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black mb-3 tracking-tighter">Our Services</h1>
          <p className="text-white/70 max-w-md mx-auto font-medium text-sm md:text-base leading-relaxed">
            Select a platform to explore our premium boosting services and start growing today.
          </p>
        </motion.div>
      </div>

      {/* Platforms Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/services/${category.id}`}
                className="group block bg-brand-card rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/5 hover:border-brand-purple/30 h-full relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${platformColors[category.id.toLowerCase()] || 'bg-brand-purple'} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity`} />
                
                <div className="flex flex-col h-full">
                  <div className={`w-16 h-16 ${platformColors[category.id.toLowerCase()] || 'bg-brand-purple text-white'} rounded-2xl flex items-center justify-center text-2xl mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 border border-white/10`}>
                    <FontAwesomeIcon icon={platformIcons[category.id.toLowerCase()] || faRocket} />
                  </div>
                  
                  <h3 className="text-2xl font-display font-black text-white mb-3 group-hover:text-brand-purple transition-colors tracking-tighter">
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-500 text-sm mb-8 flex-grow font-medium leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center text-brand-purple font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                    <span>Explore Services</span>
                    <FontAwesomeIcon icon={faChevronRight} className="ml-2 text-[8px]" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="max-w-5xl mx-auto px-6 mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-card rounded-[3.5rem] p-10 md:p-16 shadow-2xl border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
          
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter">Why Choose EasyBoost?</h2>
            <div className="w-16 h-1.5 gradient-brand mx-auto mt-4 rounded-full shadow-lg shadow-brand-blue/20" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform shadow-inner border border-brand-blue/10">
                <FontAwesomeIcon icon={faRocket} className="text-2xl" />
              </div>
              <h3 className="font-black text-white text-lg mb-2 tracking-tight">Fast Delivery</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">Orders processed within minutes of payment confirmation.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
              <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple mb-6 group-hover:scale-110 transition-transform shadow-inner border border-brand-purple/10">
                <FontAwesomeIcon icon={faShieldAlt} className="text-2xl" />
              </div>
              <h3 className="font-black text-white text-lg mb-2 tracking-tight">Secure Payments</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">Encrypted transactions, your security is our top priority.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform shadow-inner border border-emerald-500/10">
                <FontAwesomeIcon icon={faBolt} className="text-2xl" />
              </div>
              <h3 className="font-black text-white text-lg mb-2 tracking-tight">24/7 Support</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">Our expert team is always here to help you grow your reach.</p>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-6 md:gap-12">
            <div className="flex items-center space-x-2 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">
              <FontAwesomeIcon icon={faCheckCircle} className="text-brand-purple" />
              <span>Real Engagement</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">
              <FontAwesomeIcon icon={faCheckCircle} className="text-brand-purple" />
              <span>No Password Required</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">
              <FontAwesomeIcon icon={faCheckCircle} className="text-brand-purple" />
              <span>Money Back Guarantee</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
