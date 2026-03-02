import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faPlus, faEdit, faTrashAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

const announcements = [
  { id: '1', title: 'Payments delayed today', content: 'Due to technical issues with MTN, MoMo payments might take longer to reflect.', status: 'Active', date: '2026-03-02' },
  { id: '2', title: 'New services added', content: 'We have added high-quality Instagram followers and TikTok likes.', status: 'Active', date: '2026-03-01' },
  { id: '3', title: 'Maintenance tonight', content: 'The platform will be down for 30 minutes tonight for scheduled maintenance.', status: 'Expired', date: '2026-02-28' },
];

export default function AdminAnnouncements() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-dark tracking-tighter mb-2">Announcements</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Post updates and news for your users</p>
        </div>
        <button className="px-8 py-4 gradient-brand text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all active:scale-95 flex items-center space-x-3">
          <FontAwesomeIcon icon={faPlus} />
          <span>Post New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {announcements.map((ann, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-start justify-between group"
          >
            <div className="flex items-start space-x-6">
              <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center text-brand-orange text-2xl group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faBullhorn} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-display font-black text-brand-dark">{ann.title}</h3>
                  <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    ann.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {ann.status}
                  </span>
                </div>
                <p className="text-gray-500 font-bold text-sm max-w-2xl">{ann.content}</p>
                <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{ann.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center">
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center">
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
