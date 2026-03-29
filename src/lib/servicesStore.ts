import { db } from './firebase';
import { ref, get, set } from 'firebase/database';
import { smmService } from '../services/smmService';

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
  description?: string;
  guaranteed?: boolean;
  badges?: string[];
  sub_category?: string;
}

export const PLATFORMS = [
  'WhatsApp',
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
  if (n.includes('whatsapp') || n.includes(' wa ') || n.includes('group') || n.includes('channel')) return 'WhatsApp';
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
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const LOCAL_STORAGE_KEY = 'easyboost_services_cache';

export const fetchServices = async (force = false): Promise<Service[]> => {
  const now = Date.now();
  
  // 1. Check in-memory cache
  if (!force && cachedServices && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedServices;
  }

  // 2. Check localStorage cache
  if (!force) {
    const localCache = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localCache) {
      try {
        const { data, timestamp } = JSON.parse(localCache);
        if (now - timestamp < CACHE_DURATION) {
          cachedServices = data;
          lastFetchTime = timestamp;
          return data;
        }
      } catch (e) {
        console.warn("Failed to parse local services cache", e);
      }
    }
  }

  const fetchWithTimeout = async (retries = 3): Promise<Service[]> => {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        const apiServices = await smmService.getServices();
        clearTimeout(timeoutId);

        if (apiServices.error) throw new Error(apiServices.error);
        if (!Array.isArray(apiServices)) throw new Error("API returned non-array data");
        
        return apiServices;
      } catch (err: any) {
        console.warn(`Fetch attempt ${i + 1} failed:`, err.message);
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
      }
    }
    throw new Error("Failed after retries");
  };

  try {
    // Try to get from local Firebase first (as a secondary cache)
    const servicesRef = ref(db, 'services');
    const snapshot = await get(servicesRef);
    const firebaseData = snapshot.val();

    if (firebaseData && !force) {
      const services = (Object.values(firebaseData) as Service[]).map(s => ({
        ...s,
        price: Math.round(parseFloat(s.rate as any) * 1.51 * 3800)
      }));
      
      // Update caches
      cachedServices = services;
      lastFetchTime = now;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ data: services, timestamp: now }));
      
      return services;
    }

    // If not in Firebase or forced, sync from API
    console.log(`[ServicesStore] Syncing from API (force=${force})...`);
    const apiServices = await fetchWithTimeout();

    console.log(`[ServicesStore] Processing ${apiServices.length} services...`);
    const servicesUpdates: Record<string, Service> = {};
    const processedServices: Service[] = apiServices.map((s: any) => {
      const usdRate = parseFloat(s.rate);
      const finalPrice = usdRate * 1.51 * 3800;
      const platform = detectPlatform(s.name, s.category);
      
      // Sub-category detection logic (Task 5)
      let subCategory = 'General';
      const n = s.name.toLowerCase();
      if (n.includes('follower')) subCategory = 'Followers';
      else if (n.includes('like')) subCategory = 'Likes';
      else if (n.includes('view')) subCategory = 'Views';
      else if (n.includes('comment')) subCategory = 'Comments';
      else if (n.includes('share')) subCategory = 'Shares';
      else if (n.includes('member')) subCategory = 'Members';
      else if (n.includes('reaction')) subCategory = 'Reactions';
      else if (n.includes('subscriber')) subCategory = 'Subscribers';
      else if (n.includes('live')) subCategory = 'Live';
      else if (n.includes('story')) subCategory = 'Story';
      else if (n.includes('reel')) subCategory = 'Reels';

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
        updatedAt: new Date().toISOString(),
        description: s.description || '',
        guaranteed: s.refill === "1" || s.refill === true,
        badges: (s.refill === "1" || s.refill === true) ? ['guaranteed'] : [],
        sub_category: subCategory
      };
      
      servicesUpdates[s.service] = service;
      return service;
    });

    // Update Firebase in background
    set(ref(db, 'services'), servicesUpdates).catch(console.error);

    cachedServices = processedServices;
    lastFetchTime = now;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ data: processedServices, timestamp: now }));
    
    return processedServices;
  } catch (error) {
    console.error("Failed to fetch services:", error);
    
    // Final fallback: check any cache we have
    if (cachedServices) return cachedServices;
    const localCache = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localCache) return JSON.parse(localCache).data;
    
    const servicesRef = ref(db, 'services');
    const snapshot = await get(servicesRef);
    const data = snapshot.val();
    if (data) return Object.values(data) as Service[];
    
    throw error;
  }
};

export const getServicesByPlatform = (services: Service[], platform: string): Service[] => {
  const p = platform.toLowerCase();
  return services.filter(s => s.category.toLowerCase() === p);
};
