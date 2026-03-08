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
        console.log('Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        
        if (permission === 'granted') {
          // Register service worker explicitly to be sure
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker registered for FCM:', registration);

          const token = await getToken(messaging, {
            vapidKey: 'BBqOoEzbrr3eNmNSVxLHcMsfMixSwueZRv_pCWIwPhHVg9LJyuSH5hxk_0m-Mwx0DksEqqV5aoYmBz92jeRIKig',
            serviceWorkerRegistration: registration
          });
          
          if (token) {
            console.log('FCM Token generated:', token);
            setFcmToken(token);
            // Store token in database
            await set(ref(db, `fcm_tokens/${user.uid}`), {
              user_id: user.uid,
              fcm_token: token,
              device_type: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
              last_updated: serverTimestamp(),
              email: user.email
            });
          } else {
            console.warn('No FCM token received');
          }
        } else {
          console.warn('Notification permission denied');
        }
      } catch (error) {
        console.error('Notification permission/token error:', error);
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
