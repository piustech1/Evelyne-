import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, off, update } from 'firebase/database';

export interface UserData {
  name: string;
  email: string;
  balance: number;
  referralCode: string;
  referralCount?: number;
  createdAt: string;
  isAdmin?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        onValue(userRef, async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Ensure referralCode exists for existing users
            if (!data.referralCode) {
              const prefix = (data.name || 'USER').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'USER');
              const random = Math.floor(1000 + Math.random() * 9000);
              const newCode = `${prefix}${random}`;
              await update(userRef, { referralCode: newCode });
              data.referralCode = newCode;
            }
            setUserData(data);
          }
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { user, userData, loading };
}
