import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faShieldAlt, faMoneyBillWave, faGlobe, faEnvelope, faKey, faSave, faCheckCircle, faBell, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, set, update } from 'firebase/database';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('General');
  const [pushConfig, setPushConfig] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
    siteName: 'EasyBoost',
    currency: 'UGX',
    supportEmail: 'support@easyboost.com',
    timezone: 'East Africa Time (EAT)',
    maintenanceMode: false,
    emailVerification: true,
    minDeposit: 5000,
    maxDeposit: 1000000,
    profitPercentage: 20,
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

    // Check if push notifications are configured
    const checkPushConfig = async () => {
      try {
        const response = await fetch('/api/admin/check-push-config');
        const data = await response.json();
        setPushConfig(data);
      } catch (err) {
        console.error('Failed to check push config', err);
        setPushConfig({ configured: false, error: true });
      }
    };
    checkPushConfig();
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
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tighter mb-2">Settings</h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Configure your platform's global parameters</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-blue-600/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center space-x-3 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FontAwesomeIcon icon={saveSuccess ? faCheckCircle : faSave} className={saveSuccess ? 'text-emerald-400' : ''} />
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 flex md:flex-col overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 gap-4">
          {['General', 'Payments', 'Notifications', 'Security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 md:w-full text-left px-8 py-5 rounded-[2rem] text-[10px] md:text-sm font-black uppercase tracking-widest transition-all border ${
                activeTab === tab 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg shadow-blue-600/20' 
                : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50 hover:text-gray-900'
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
            className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100 space-y-12"
          >
            {activeTab === 'General' && (
              <div className="space-y-10">
                <h3 className="text-2xl font-display font-black text-gray-900 tracking-tighter flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-lg border border-blue-100">
                    <FontAwesomeIcon icon={faGlobe} />
                  </div>
                  <span>General Settings</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Site Name</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => handleChange('siteName', e.target.value)}
                      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Currency Code</label>
                    <input
                      type="text"
                      value={settings.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Support Email</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleChange('supportEmail', e.target.value)}
                      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Timezone</label>
                    <select 
                      value={settings.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold appearance-none"
                    >
                      <option value="East Africa Time (EAT)">East Africa Time (EAT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Payments' && (
              <div className="space-y-10">
                <h3 className="text-2xl font-display font-black text-gray-900 tracking-tighter flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-lg border border-emerald-100">
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                  </div>
                  <span>Payment Settings</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Min Deposit ({settings.currency})</label>
                    <input
                      type="number"
                      value={settings.minDeposit}
                      onChange={(e) => handleChange('minDeposit', Number(e.target.value))}
                      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Deposit ({settings.currency})</label>
                    <input
                      type="number"
                      value={settings.maxDeposit}
                      onChange={(e) => handleChange('maxDeposit', Number(e.target.value))}
                      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profit Percentage (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.profitPercentage}
                        onChange={(e) => handleChange('profitPercentage', Number(e.target.value))}
                        className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold"
                      />
                      <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-gray-400 font-black">
                        %
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest ml-1">Added to original service rate</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="space-y-10">
                <h3 className="text-2xl font-display font-black text-gray-900 tracking-tighter flex items-center space-x-4">
                  <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center text-brand-purple text-lg border border-brand-purple/20">
                    <FontAwesomeIcon icon={faBell} />
                  </div>
                  <span>Push Notifications</span>
                </h3>

                <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-gray-900">Configuration Status</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Firebase Cloud Messaging (FCM)</div>
                    </div>
                    {pushConfig === null ? (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Checking...</span>
                      </div>
                    ) : pushConfig.configured ? (
                      <div className="flex items-center space-x-2 text-emerald-500 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Configured</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-[10px]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Not Configured</span>
                      </div>
                    )}
                  </div>

                  {!pushConfig?.configured && pushConfig !== null && (
                    <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-3">
                      <div className="text-[10px] font-bold text-rose-600 leading-relaxed space-y-2">
                        <p>Push notifications require a valid Firebase Service Account key.</p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="p-3 bg-white/50 rounded-xl border border-rose-100">
                            <div className="text-[8px] text-gray-400 uppercase mb-1">Credentials Status</div>
                            <div className="font-black">{pushConfig.hasEnv ? '✅ DETECTED' : '❌ MISSING'}</div>
                          </div>
                          <div className="p-3 bg-white/50 rounded-xl border border-rose-100">
                            <div className="text-[8px] text-gray-400 uppercase mb-1">Initialization</div>
                            <div className="font-black">{pushConfig.appCount > 0 ? '✅ ACTIVE' : '❌ FAILED'}</div>
                          </div>
                        </div>
                        {pushConfig.error && (
                          <div className="mt-4 p-4 bg-rose-100/50 rounded-2xl border border-rose-200 text-rose-700">
                            <div className="text-[8px] uppercase font-black mb-1 opacity-50">Error Details</div>
                            <div className="font-mono text-[9px] break-all">{pushConfig.error}</div>
                          </div>
                        )}
                        {!pushConfig.hasEnv && !pushConfig.error && (
                          <p className="mt-4 p-3 bg-rose-100/50 rounded-xl border border-rose-200">
                            <strong>Note:</strong> Credentials were not found in environment variables or the linked Google Apps Script.
                          </p>
                        )}
                      </div>
                      <a 
                        href="https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-block text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                      >
                        Get Service Account Key →
                      </a>
                    </div>
                  )}

                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-black text-gray-900">Enable Push Notifications</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Allow platform to send broadcast alerts</div>
                      </div>
                      <button 
                        onClick={() => handleChange('pushEnabled', !settings.pushEnabled)}
                        className={`w-14 h-8 rounded-full relative transition-all ${settings.pushEnabled ? 'bg-brand-purple' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.pushEnabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="space-y-10">
                <h3 className="text-2xl font-display font-black text-gray-900 tracking-tighter flex items-center space-x-4">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 text-lg border border-rose-100">
                    <FontAwesomeIcon icon={faShieldAlt} />
                  </div>
                  <span>Security & Maintenance</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                    <div>
                      <div className="text-sm font-black text-gray-900">Maintenance Mode</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disable site for all users except admins</div>
                    </div>
                    <button 
                      onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
                      className={`w-14 h-8 rounded-full relative transition-all ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                    <div>
                      <div className="text-sm font-black text-gray-900">Email Verification</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Require users to verify email on signup</div>
                    </div>
                    <button 
                      onClick={() => handleChange('emailVerification', !settings.emailVerification)}
                      className={`w-14 h-8 rounded-full relative transition-all ${settings.emailVerification ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.emailVerification ? 'right-1' : 'left-1'}`} />
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
