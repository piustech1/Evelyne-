import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faInfoCircle, faRocket, faUserFriends, faTrash } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { ref, onValue, set, remove } from 'firebase/database';

interface Notification {
  id: string;
  title?: string;
  message: string;
  type: 'deposit' | 'referral' | 'system';
  timestamp: string;
  read: boolean;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const notificationsRef = ref(db, `notifications/${user.uid}`);
      onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const notifsArray = Object.entries(data).map(([id, value]: [string, any]) => ({
            id,
            ...value,
          })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setNotifications(notifsArray);
        } else {
          setNotifications([]);
        }
        setIsLoading(false);
      });
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    if (user) {
      const notifRef = ref(db, `notifications/${user.uid}/${id}/read`);
      await set(notifRef, true);
    }
  };

  const markAllAsRead = async () => {
    if (user && notifications.length > 0) {
      const updates: any = {};
      notifications.forEach(n => {
        updates[`notifications/${user.uid}/${n.id}/read`] = true;
      });
      // We can use a batch update if needed, but for simplicity:
      for (const n of notifications) {
        if (!n.read) {
          await set(ref(db, `notifications/${user.uid}/${n.id}/read`), true);
        }
      }
    }
  };

  const deleteNotification = async (id: string) => {
    if (user) {
      await remove(ref(db, `notifications/${user.uid}/${id}`));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return faCheckCircle;
      case 'referral': return faUserFriends;
      case 'system': return faInfoCircle;
      default: return faBell;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-emerald-500 bg-emerald-50';
      case 'referral': return 'text-blue-500 bg-blue-50';
      case 'system': return 'text-purple-500 bg-purple-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="pt-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <FontAwesomeIcon icon={faBell} className="text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-gray-900 tracking-tighter">Notifications</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Stay updated with your activity</p>
          </div>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active-press"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-50 rounded-3xl shimmer border border-gray-100" />
          ))
        ) : notifications.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {notifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative p-6 rounded-[2rem] border transition-all hover-lift ${
                  notif.read ? 'bg-white border-gray-100' : 'bg-blue-50/30 border-blue-100 shadow-sm'
                }`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                {!notif.read && (
                  <div className="absolute top-6 right-6 w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                )}
                
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shrink-0 ${getColor(notif.type)}`}>
                    <FontAwesomeIcon icon={getIcon(notif.type)} />
                  </div>
                  
                  <div className="flex-grow space-y-1">
                    {notif.title && (
                      <h4 className={`text-sm font-black tracking-tight ${notif.read ? 'text-gray-900' : 'text-blue-600'}`}>
                        {notif.title}
                      </h4>
                    )}
                    <p className={`text-sm leading-relaxed ${notif.read ? 'text-gray-600' : 'text-gray-900 font-bold'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(notif.timestamp).toLocaleString()}
                      </span>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-rose-500 transition-all"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200 text-3xl shadow-sm">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter">All caught up!</h3>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest max-w-xs mx-auto">You have no new notifications at the moment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
