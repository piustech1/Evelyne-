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
    const isGas = !!GAS_URL && GAS_URL !== 'undefined' && GAS_URL !== '';
    const url = isGas ? GAS_URL : `/api/smm/${action === 'add' ? 'order' : action}`;
    
    console.log(`[SMM Service] Action: ${action}, Using GAS: ${isGas}, URL: ${url}`);

    try {
      const fetchOptions: RequestInit = isGas ? {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, ...params }),
      } : {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      };

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        throw new Error(`${isGas ? 'GAS' : 'Local'} Proxy error! Status: ${response.status}. Details: ${errorText}`);
      }

      const text = await response.text();
      if (!text) throw new Error(`Empty response from ${isGas ? 'GAS' : 'Local'} Proxy`);
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error(`[SMM Service] JSON Parse Error. Raw text:`, text);
        throw new Error(`Invalid JSON response from ${isGas ? 'GAS' : 'Local'} Proxy`);
      }
    } catch (error: any) {
      console.error(`[SMM Service] Error (${action}):`, error);
      
      // Provide more helpful error messages for common issues
      if (error.message === 'Failed to fetch') {
        if (isGas) {
          return { error: "Network error: Failed to connect to Google Apps Script. Please ensure the URL is correct and deployed as 'Anyone'." };
        } else {
          return { error: "Network error: Failed to connect to local API. If on Vercel, ensure VITE_SMM_GAS_URL is set." };
        }
      }
      
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
