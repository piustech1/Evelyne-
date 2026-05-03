import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Hammer, Clock, Zap, ShieldCheck, Heart } from 'lucide-react';

interface TimeLeft {
  hours: string;
  minutes: string;
  seconds: string;
}

interface MaintenancePageProps {
  startTime?: number;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ startTime }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!startTime) return;

      const now = Date.now();
      const target = startTime + 24 * 60 * 60 * 1000; // 24 hours from start
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      });
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/44/425/HD-wallpaper-30k-social-media-icon-smm-thumbnail.jpg")' }}
      id="maintenance-page"
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-2xl px-6"
      >
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-12">
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              <Hammer size={40} />
            </motion.div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              🚧 Super Boost Under Maintenance
            </h1>
            <p className="mx-auto max-w-md text-lg text-blue-100/80">
              We are working hard to improve your experience 💪 Fixing recent issues, boosting performance, and making our services stronger than ever 🚀
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="mb-10 flex items-center justify-center gap-4 md:gap-6">
            {[
              { label: 'HH', value: timeLeft.hours },
              { label: 'MM', value: timeLeft.minutes },
              { label: 'SS', value: timeLeft.seconds }
            ].map((item, idx) => (
              <React.Fragment key={item.label}>
                <div className="flex flex-col items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] backdrop-blur-md md:h-24 md:w-24 md:text-4xl">
                    {item.value}
                  </div>
                  <span className="mt-2 text-xs font-semibold uppercase tracking-widest text-blue-300/60">
                    {item.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className="text-3xl font-bold text-blue-400/50 md:text-4xl">:</div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Features List */}
          <div className="mb-10 grid grid-cols-1 gap-4 rounded-2xl bg-black/20 p-6 md:grid-cols-3">
            <div className="flex items-center gap-3 text-sm text-white/90">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span>Faster service delivery</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/90">
              <ShieldCheck className="h-5 w-5 text-green-400" />
              <span>Zero drops guarantee</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/90">
              <Heart className="h-5 w-5 text-red-400" />
              <span>Better user experience</span>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center">
            <p className="mb-4 text-white/70">
              We appreciate your patience 🤝 We’ll be back better and stronger!
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-400 font-semibold">
              <span>— Team Super Boost</span>
              <Heart size={16} className="fill-current" />
            </div>
          </div>

          {/* Progress Line */}
          <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden bg-white/5">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
