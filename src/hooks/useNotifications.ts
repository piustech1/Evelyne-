import { useEffect, useState } from 'react';
import { messaging, db } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { ref, set, push, serverTimestamp } from 'firebase/database';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const { user } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !messaging) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: 'BGH9n9_vX7_6_Y_9_vX7_6_Y_9_vX7_6_Y_9_vX7_6_Y_9_vX7_6_Y_9_vX7_6_Y_9_vX7_6_Y_9_vX7_6_Y' // Replace with your actual VAPID key if needed, or leave it if you have one configured in Firebase console.
          });
          
          if (token) {
            setFcmToken(token);
            // Store token in database
            await set(ref(db, `fcm_tokens/${user.uid}`), {
              user_id: user.uid,
              fcm_token: token,
              device_type: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
              created_at: serverTimestamp(),
              email: user.email
            });
          }
        }
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    };

    requestPermission();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      if (payload.notification) {
        toast(payload.notification.body || '', {
          icon: '🔔',
          duration: 5000,
        });
        
        // Also save to in-app notifications
        const notifRef = push(ref(db, `notifications/${user.uid}`));
        set(notifRef, {
          title: payload.notification.title,
          message: payload.notification.body,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'system'
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  return { fcmToken };
};
