/**
 * SMM Service
 * Centralizes all SMM API calls and handles redirection to Google Apps Script (GAS)
 * to bypass Vercel IP blocking issues.
 */

const GAS_URL = import.meta.env.VITE_SMM_GAS_URL;

export interface SMMResponse {
  error?: string;
  [key: string]: any;
}

export const smmService = {
  /**
   * Generic call to SMM API (via GAS or local proxy)
   */
  async call(action: string, params: any = {}): Promise<SMMResponse> {
    try {
      if (GAS_URL) {
        // Direct call to Google Apps Script
        const response = await fetch(GAS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8', // GAS doPost requires this for simple CORS
          },
          body: JSON.stringify({ action, ...params }),
        });

        if (!response.ok) {
          throw new Error(`GAS Proxy error! status: ${response.status}`);
        }

        const text = await response.text();
        if (!text) throw new Error("Empty response from GAS Proxy");
        
        return JSON.parse(text);
      } else {
        // Fallback to local server proxy
        const endpoint = action === 'add' ? 'order' : action;
        const response = await fetch(`/api/smm/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`Local Proxy error! status: ${response.status}`);
        }

        const text = await response.text();
        if (!text) throw new Error("Empty response from local proxy");
        
        return JSON.parse(text);
      }
    } catch (error: any) {
      console.error(`SMM Service Error (${action}):`, error);
      return { error: error.message || "Unknown error occurred" };
    }
  },

  /**
   * Fetch service list
   */
  async getServices() {
    return this.call('services');
  },

  /**
   * Place a new order
   */
  async placeOrder(service: string | number, link: string, quantity: number) {
    return this.call('add', { service, link, quantity });
  },

  /**
   * Check order status
   */
  async getStatus(orderId: string | number) {
    return this.call('status', { orderId });
  },

  /**
   * Check multiple orders status
   */
  async getStatuses(orderIds: string[]) {
    return this.call('orders', { orders: orderIds.join(',') });
  },

  /**
   * Check account balance
   */
  async getBalance() {
    return this.call('balance');
  },

  /**
   * Request order refill
   */
  async refill(orderId: string | number) {
    return this.call('refill', { order: orderId });
  },

  /**
   * Cancel an order
   */
  async cancel(orderId: string | number) {
    return this.call('cancel', { order: orderId });
  }
};
