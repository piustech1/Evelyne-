import { useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue, update, push, set, get } from 'firebase/database';
import { useAuth } from './useAuth';

export function useOrderStatusSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const ordersRef = ref(db, 'orders');
    
    // Listen for orders
    const unsubscribe = onValue(ordersRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const activeOrders = Object.entries(data)
        .filter(([_, order]: [string, any]) => 
          order.userId === user.uid && 
          ['Pending', 'Processing', 'In progress', 'Partial'].includes(order.status) &&
          order.smmOrderId // Must have an SMM order ID
        );

      for (const [id, order] of activeOrders as [string, any][]) {
        try {
          const response = await fetch('/api/smm/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.smmOrderId })
          });
          
          const statusData = await response.json();
          
          if (statusData.status && statusData.status !== order.status) {
            // Status changed!
            const newStatus = statusData.status;
            
            // Update order in DB
            await update(ref(db, `orders/${id}`), {
              status: newStatus,
              remains: statusData.remains || 0,
              start_count: statusData.start_count || 0,
              updatedAt: new Date().toISOString()
            });

            // Create in-app notification
            const notifRef = push(ref(db, `notifications/${user.uid}`));
            const title = `Order #${id.slice(-6).toUpperCase()} Update`;
            const message = `Your order for ${order.service} is now ${newStatus}.`;
            
            await set(notifRef, {
              title,
              message,
              timestamp: new Date().toISOString(),
              read: false,
              type: 'order',
              orderId: id
            });

            // Note: Push notification will be handled by the background listener in useNotifications
            // if we were using a real backend. For now, the user will see it when they open the app.
          }
        } catch (error) {
          console.error(`Failed to sync order ${id}:`, error);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);
}
