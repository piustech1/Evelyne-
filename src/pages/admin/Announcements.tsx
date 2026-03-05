import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faPlus, faEdit, faTrashAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'Active'
  });

  useEffect(() => {
    const annRef = ref(db, 'announcements');
    onValue(annRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAnnouncements(Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setAnnouncements([]);
      }
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnn) {
        await update(ref(db, `announcements/${editingAnn.id}`), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        const newRef = push(ref(db, 'announcements'));
        await set(newRef, {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
      setEditingAnn(null);
      setFormData({ title: '', content: '', status: 'Active' });
    } catch (err) {
      console.error('Failed to save announcement', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await remove(ref(db, `announcements/${id}`));
      } catch (err) {
        console.error('Failed to delete announcement', err);
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tighter mb-2">Announcements</h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Post updates and news for your users</p>
        </div>
        <button 
          onClick={() => {
            setEditingAnn(null);
            setFormData({ title: '', content: '', status: 'Active' });
            setIsModalOpen(true);
          }}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center space-x-3"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Post New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {announcements.map((ann, idx) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-start justify-between group gap-6"
          >
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl group-hover:scale-110 transition-transform border border-blue-100 shadow-sm">
                <FontAwesomeIcon icon={faBullhorn} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <h3 className="text-2xl font-display font-black text-gray-900 tracking-tighter">{ann.title}</h3>
                  <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    ann.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                    {ann.status}
                  </span>
                </div>
                <p className="text-gray-500 font-medium text-sm max-w-2xl leading-relaxed">{ann.content}</p>
                <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pt-2">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  setEditingAnn(ann);
                  setFormData({ title: ann.title, content: ann.content, status: ann.status });
                  setIsModalOpen(true);
                }}
                className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-all flex items-center justify-center border border-gray-100"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button 
                onClick={() => handleDelete(ann.id)}
                className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center border border-gray-100"
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          </motion.div>
        ))}
        {announcements.length === 0 && !isLoading && (
          <div className="py-32 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-3xl mx-auto">
              <FontAwesomeIcon icon={faBullhorn} />
            </div>
            <div className="text-gray-600 font-black uppercase tracking-widest text-xs">No announcements posted yet</div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 relative z-10"
          >
            <h2 className="text-3xl font-display font-black text-gray-900 tracking-tighter mb-10">
              {editingAnn ? 'Edit Announcement' : 'Post Announcement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold placeholder-gray-400"
                  placeholder="e.g. System Maintenance"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold h-40 placeholder-gray-400"
                  placeholder="Announcement details..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold appearance-none"
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-2 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {editingAnn ? 'Update' : 'Post'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
