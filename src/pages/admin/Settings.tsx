import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faShieldAlt, faMoneyBillWave, faGlobe, faEnvelope, faKey, faSave } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

export default function AdminSettings() {
  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-brand-dark tracking-tighter mb-1 md:mb-2">Settings</h1>
          <p className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest">Configure your platform's global parameters</p>
        </div>
        <button className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 gradient-brand text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center space-x-3">
          <FontAwesomeIcon icon={faSave} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <div className="lg:col-span-4 flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-2 md:gap-4 -mx-6 px-6 md:mx-0 md:px-0">
          {['General', 'Payments', 'API', 'Security', 'Notifications'].map((tab, idx) => (
            <button
              key={idx}
              className={`flex-shrink-0 md:w-full text-left px-6 md:px-8 py-3 md:py-5 rounded-2xl md:rounded-3xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${
                tab === 'General' 
                ? 'bg-brand-orange text-white shadow-xl shadow-brand-orange/20' 
                : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 space-y-6 md:space-y-10">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 space-y-8 md:space-y-10">
            <div className="space-y-6 md:space-y-8">
              <h3 className="text-lg md:text-xl font-display font-black text-brand-dark tracking-tighter flex items-center space-x-3">
                <FontAwesomeIcon icon={faGlobe} className="text-brand-orange" />
                <span>General Settings</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2 md:space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Site Name</label>
                  <input
                    type="text"
                    defaultValue="EasyBoost"
                    className="block w-full px-5 md:px-6 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-dark font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all text-sm"
                  />
                </div>
                <div className="space-y-2 md:space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Currency Symbol</label>
                  <input
                    type="text"
                    defaultValue="UGX"
                    className="block w-full px-5 md:px-6 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-dark font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all text-sm"
                  />
                </div>
                <div className="space-y-2 md:space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Support Email</label>
                  <input
                    type="email"
                    defaultValue="support@easyboost.com"
                    className="block w-full px-5 md:px-6 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-dark font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all text-sm"
                  />
                </div>
                <div className="space-y-2 md:space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Timezone</label>
                  <select className="block w-full px-5 md:px-6 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-dark font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all text-sm">
                    <option>East Africa Time (EAT)</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-8 md:pt-10 border-t border-gray-50 space-y-6 md:space-y-8">
              <h3 className="text-lg md:text-xl font-display font-black text-brand-dark tracking-tighter flex items-center space-x-3">
                <FontAwesomeIcon icon={faShieldAlt} className="text-brand-orange" />
                <span>Security Settings</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gray-50 border border-gray-100">
                  <div>
                    <div className="text-xs md:text-sm font-black text-brand-dark">Maintenance Mode</div>
                    <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disable site for all users except admins</div>
                  </div>
                  <div className="w-12 h-7 md:w-14 md:h-8 bg-gray-200 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 left-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gray-50 border border-gray-100">
                  <div>
                    <div className="text-xs md:text-sm font-black text-brand-dark">Email Verification</div>
                    <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Require users to verify email on signup</div>
                  </div>
                  <div className="w-12 h-7 md:w-14 md:h-8 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 right-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
