import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faShieldAlt, faMoneyBillWave, faGlobe, faEnvelope, faKey, faSave, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, set, update } from 'firebase/database';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState<any>({
    siteName: 'EasyBoost',
    currency: 'UGX',
    supportEmail: 'support@easyboost.com',
    timezone: 'East Africa Time (EAT)',
    maintenanceMode: false,
    emailVerification: true,
    minDeposit: 5000,
    maxDeposit: 1000000,
    apiEnabled: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSettings(data);
      }
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await set(ref(db, 'settings'), settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter mb-2">Settings</h1>
          <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Configure your platform's global parameters</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`px-8 py-4 gradient-brand text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-brand-blue/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center space-x-3 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FontAwesomeIcon icon={saveSuccess ? faCheckCircle : faSave} className={saveSuccess ? 'text-emerald-400' : ''} />
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 flex md:flex-col overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 gap-4">
          {['General', 'Payments', 'Security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 md:w-full text-left px-8 py-5 rounded-[2rem] text-[10px] md:text-sm font-black uppercase tracking-widest transition-all border ${
                activeTab === tab 
                ? 'bg-brand-purple text-white border-brand-purple shadow-2xl shadow-brand-purple/20' 
                : 'bg-brand-card text-gray-500 border-white/5 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="lg:col-span-8">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-brand-card p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5 space-y-12"
          >
            {activeTab === 'General' && (
              <div className="space-y-10">
                <h3 className="text-2xl font-display font-black text-white tracking-tighter flex items-center space-x-4">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue text-lg border border-brand-blue/10">
                    <FontAwesomeIcon icon={faGlobe} />
                  </div>
                  <span>General Settings</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Site Name</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => handleChange('siteName', e.target.value)}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Currency Code</label>
                    <input
                      type="text"
                      value={settings.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Support Email</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleChange('supportEmail', e.target.value)}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Timezone</label>
                    <select 
                      value={settings.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold appearance-none"
                    >
                      <option value="East Africa Time (EAT)" className="bg-brand-dark">East Africa Time (EAT)</option>
                      <option value="UTC" className="bg-brand-dark">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Payments' && (
              <div className="space-y-10">
                <h3 className="text-2xl font-display font-black text-white tracking-tighter flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 text-lg border border-emerald-500/10">
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                  </div>
                  <span>Payment Settings</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Min Deposit ({settings.currency})</label>
                    <input
                      type="number"
                      value={settings.minDeposit}
                      onChange={(e) => handleChange('minDeposit', Number(e.target.value))}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Max Deposit ({settings.currency})</label>
                    <input
                      type="number"
                      value={settings.maxDeposit}
                      onChange={(e) => handleChange('maxDeposit', Number(e.target.value))}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="space-y-10">
                <h3 className="text-2xl font-display font-black text-white tracking-tighter flex items-center space-x-4">
                  <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 text-lg border border-rose-500/10">
                    <FontAwesomeIcon icon={faShieldAlt} />
                  </div>
                  <span>Security & Maintenance</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
                    <div>
                      <div className="text-sm font-black text-white">Maintenance Mode</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Disable site for all users except admins</div>
                    </div>
                    <button 
                      onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
                      className={`w-14 h-8 rounded-full relative transition-all ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-xl transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
                    <div>
                      <div className="text-sm font-black text-white">Email Verification</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Require users to verify email on signup</div>
                    </div>
                    <button 
                      onClick={() => handleChange('emailVerification', !settings.emailVerification)}
                      className={`w-14 h-8 rounded-full relative transition-all ${settings.emailVerification ? 'bg-emerald-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-xl transition-all ${settings.emailVerification ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
