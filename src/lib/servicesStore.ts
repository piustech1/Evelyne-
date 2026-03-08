import { db } from './firebase';
import { ref, get, set } from 'firebase/database';

export interface Service {
  service: string;
  apiServiceId: string;
  name: string;
  type: string;
  category: string;
  categoryId: string;
  rate: number;
  price: number;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
  status: string;
  updatedAt: string;
}

export const PLATFORMS = [
  'TikTok',
  'Instagram',
  'Facebook',
  'YouTube',
  'Telegram',
  'Twitter',
  'Spotify',
  'SoundCloud',
  'Twitch',
  'LinkedIn',
  'Snapchat',
  'Kick',
  'Vimeo',
  'Deezer',
  'Google Play',
  'Website Traffic',
  'CoinMarketCap',
  'Others'
];

export const detectPlatform = (name: string, category: string = ''): string => {
  const n = (name + ' ' + category).toLowerCase();
  
  if (n.includes('tiktok')) return 'TikTok';
  if (n.includes('instagram') || n.includes(' ig ')) return 'Instagram';
  if (n.includes('facebook') || n.includes(' fb ')) return 'Facebook';
  if (n.includes('youtube') || n.includes(' yt ')) return 'YouTube';
  if (n.includes('telegram') || n.includes(' tg ')) return 'Telegram';
  if (n.includes('twitter') || n.includes(' x ') || n.includes(' x-') || n.includes(' x ')) return 'Twitter';
  if (n.includes('spotify')) return 'Spotify';
  if (n.includes('soundcloud')) return 'SoundCloud';
  if (n.includes('twitch')) return 'Twitch';
  if (n.includes('linkedin')) return 'LinkedIn';
  if (n.includes('clubhouse')) return 'Clubhouse';
  if (n.includes('google play') || n.includes('play store') || n.includes('android app')) return 'Google Play';
  if (n.includes('deezer')) return 'Deezer';
  if (n.includes('vimeo')) return 'Vimeo';
  if (n.includes('traffic') || n.includes('website') || n.includes('site visit') || n.includes('seo') || n.includes('organic traffic')) return 'Website Traffic';
  if (n.includes('kick')) return 'Kick';
  if (n.includes('snapchat') || n.includes(' snap ')) return 'Snapchat';
  if (n.includes('coinmarketcap') || n.includes('crypto') || n.includes('coin market')) return 'CoinMarketCap';
  
  return 'Others';
};

let cachedServices: Service[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchServices = async (force = false): Promise<Service[]> => {
  const now = Date.now();
  if (!force && cachedServices && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedServices;
  }

  try {
    // Try to get from local Firebase first
    const servicesRef = ref(db, 'services');
    const snapshot = await get(servicesRef);
    const data = snapshot.val();

    if (data && !force) {
      const services = Object.values(data) as Service[];
      cachedServices = services;
      lastFetchTime = now;
      return services;
    }

    // If not in Firebase or forced, try to sync from API
    const settingsSnap = await get(ref(db, 'settings'));
    const profit = settingsSnap.val()?.profitPercentage || 20;

    const response = await fetch('/api/smm/services', { 
      method: 'POST',
      signal: AbortSignal.timeout(10000) // 10s timeout
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const text = await response.text();
    if (!text || (!text.startsWith("[") && !text.startsWith("{"))) {
      throw new Error("Invalid response format from API");
    }

    const apiServices = JSON.parse(text);
    if (apiServices.error) throw new Error(apiServices.error);
    if (!Array.isArray(apiServices)) throw new Error("API returned non-array data");

    const servicesUpdates: Record<string, Service> = {};
    const processedServices: Service[] = apiServices.map((s: any) => {
      const usdRate = parseFloat(s.rate);
      // Apply profit markup and convert to local currency
      const profitMultiplier = Number(import.meta.env.VITE_PROFIT_MULTIPLIER) || 3;
      const exchangeRate = Number(import.meta.env.VITE_EXCHANGE_RATE) || 3800;
      const finalPrice = usdRate * profitMultiplier * exchangeRate;
      
      const platform = detectPlatform(s.name, s.category);
      
      const service: Service = {
        service: s.service,
        apiServiceId: s.service,
        name: s.name,
        type: s.type,
        category: platform,
        categoryId: platform.toLowerCase(),
        rate: usdRate,
        price: Math.round(finalPrice),
        min: parseInt(s.min) || 0,
        max: parseInt(s.max) || 0,
        refill: s.refill === "1" || s.refill === true,
        cancel: s.cancel === "1" || s.cancel === true,
        status: 'Active',
        updatedAt: new Date().toISOString()
      };
      
      servicesUpdates[s.service] = service;
      return service;
    });

    // Update Firebase in background
    set(ref(db, 'services'), servicesUpdates).catch(console.error);

    cachedServices = processedServices;
    lastFetchTime = now;
    return processedServices;
  } catch (error) {
    console.error("Failed to fetch services:", error);
    // If API fails, try to return whatever we have in cache or Firebase
    if (cachedServices) return cachedServices;
    
    const servicesRef = ref(db, 'services');
    const snapshot = await get(servicesRef);
    const data = snapshot.val();
    if (data) {
      const services = Object.values(data) as Service[];
      cachedServices = services;
      return services;
    }
    
    throw error;
  }
};

export const getServicesByPlatform = (services: Service[], platform: string): Service[] => {
  const p = platform.toLowerCase();
  return services.filter(s => s.category.toLowerCase() === p);
};
