import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faShieldAlt, faMoneyBillWave, faGlobe, faEnvelope, faKey, faSave } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

export default function AdminSettings() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-dark tracking-tighter mb-2">Settings</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Configure your platform's global parameters</p>
        </div>
        <button className="px-8 py-4 gradient-brand text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all active:scale-95 flex items-center space-x-3">
          <FontAwesomeIcon icon={faSave} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-4">
          {['General', 'Payments', 'API', 'Security', 'Notifications'].map((tab, idx) => (
            <button
              key={idx}
              className={`w-full text-left px-8 py-5 rounded-3xl text-sm font-black uppercase tracking-widest transition-all ${
                tab === 'General' 
                ? 'bg-brand-orange text-white shadow-xl shadow-brand-orange/20' 
                : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-10">
            <div className="space-y-8">
              <h3 className="text-xl font-display font-black text-brand-dark tracking-tighter flex items-center space-x-3">
                <FontAwesomeIcon icon={faGlobe} className="text-brand-orange" />
                <span>General Settings</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Site Name</label>
                  <input
                    type="text"
                    defaultValue="EasyBoost"
                    className="block w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-dark font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Currency Symbol</label>
                  <input
                    type="text"
                    defaultValue="UGX"
                    className="block w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-dark font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Support Email</label>
                  <input
                    type="email"
                    defaultValue="support@easyboost.com"
                    className="block w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-dark font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Timezone</label>
                  <select className="block w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-dark font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange focus:bg-white transition-all">
                    <option>East Africa Time (EAT)</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-50 space-y-8">
              <h3 className="text-xl font-display font-black text-brand-dark tracking-tighter flex items-center space-x-3">
                <FontAwesomeIcon icon={faShieldAlt} className="text-brand-orange" />
                <span>Security Settings</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <div>
                    <div className="text-sm font-black text-brand-dark">Maintenance Mode</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disable site for all users except admins</div>
                  </div>
                  <div className="w-14 h-8 bg-gray-200 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <div>
                    <div className="text-sm font-black text-brand-dark">Email Verification</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Require users to verify email on signup</div>
                  </div>
                  <div className="w-14 h-8 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow-sm" />
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
