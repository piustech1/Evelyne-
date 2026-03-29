/**
 * SMM Service
 * Centralizes all SMM API calls and handles redirection to Google Apps Script (GAS)
 * to bypass Vercel IP blocking issues.
 */

const GAS_URL = import.meta.env.VITE_SMM_GAS_URL || 'https://script.google.com/macros/s/AKfycbyJV7Rdv_6O2XDvowgCldCGW00pbFxrWlvvevzx6zr-05TsQJubWE42HjJ0vhNtG72N/exec';

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
    
    if (isGas) {
      console.log(`[SMM Service] Action: ${action}, Using GAS Proxy: ${url}`);
    } else {
      console.log(`[SMM Service] Action: ${action}, Using Local Proxy: ${url} (Note: Local proxy only works on full-stack servers, not static hosting like Vercel)`);
    }

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

      let response;
      try {
        response = await fetch(url, fetchOptions);
      } catch (fetchError: any) {
        // If GAS fails, try to fallback to local proxy if we haven't already
        if (isGas) {
          console.warn(`[SMM Service] GAS Proxy failed, falling back to local proxy...`, fetchError);
          const fallbackUrl = `/api/smm/${action === 'add' ? 'order' : action}`;
          response = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          });
        } else {
          throw fetchError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        
        if (response.status === 405) {
          throw new Error(`Method Not Allowed (405). This usually happens when calling a local API on a static hosting platform (like Vercel). You MUST set the VITE_SMM_GAS_URL environment variable to use the Google Apps Script proxy for production.`);
        }
        
        throw new Error(`${isGas ? 'GAS' : 'Local'} Proxy error! Status: ${response.status}. Details: ${errorText}`);
      }

      const text = await response.text();
      console.log(`[SMM Service] Raw response from ${isGas ? 'GAS' : 'Local'} Proxy:`, text.substring(0, 200) + (text.length > 200 ? '...' : ''));
      if (!text) throw new Error(`Empty response from ${isGas ? 'GAS' : 'Local'} Proxy`);
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error(`[SMM Service] JSON Parse Error. Raw text:`, text);
        throw new Error(`Invalid JSON response from ${isGas ? 'GAS' : 'Local'} Proxy`);
      }
    } catch (error: any) {
      console.error(`[SMM Service] Full Error Object (${action}):`, error);
      
      // Provide more helpful error messages for common issues
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        if (isGas) {
          return { error: `Network error: Failed to connect to Google Apps Script at ${url}. Please ensure the URL is correct, the script is deployed as 'Anyone', and you have an active internet connection.` };
        } else {
          return { error: `Network error: Failed to connect to local API at ${url}. If you are on a deployed site (like Vercel), you MUST set the VITE_SMM_GAS_URL environment variable because the local proxy only works in the development environment or on a full-stack server.` };
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
   * Check refill status
   */
  async refillStatus(refillId: string | number) {
    return this.call('refill_status', { refill: refillId });
  },

  /**
   * Cancel an order
   */
  async cancel(orderId: string | number) {
    return this.call('cancel', { order: orderId });
  }
};
