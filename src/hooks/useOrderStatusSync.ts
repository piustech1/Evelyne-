import { useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue, update, push, set, get } from 'firebase/database';
import { useAuth } from './useAuth';
import { smmService } from '../services/smmService';

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
          (order.apiOrderId || order.smmOrderId)
        );

      for (const [id, order] of activeOrders as [string, any][]) {
        try {
          const orderId = order.apiOrderId || order.smmOrderId;
          const statusData = await smmService.getStatus(orderId);
          
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

            // Send actual push notification via backend
            try {
              const tokenSnapshot = await get(ref(db, `fcm_tokens/${user.uid}`));
              const tokenData = tokenSnapshot.val();
              if (tokenData?.fcm_token) {
                await fetch('/api/admin/send-notification', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    tokens: [tokenData.fcm_token],
                    title,
                    message,
                    url: '/orders'
                  })
                });
              }
            } catch (pushErr) {
              console.error('Failed to send order status push:', pushErr);
            }
          }
        } catch (error) {
          console.error(`Failed to sync order ${id}:`, error);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);
}
