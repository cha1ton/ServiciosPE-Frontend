// frontend/src/lib/searchCache.ts

// Guarda/lee la última búsqueda Nearby en sessionStorage para
// reutilizar datos en la página de detalle sin otra llamada.
import { SearchItem } from './search';

const KEY = 'nearby_cache_v1';

export interface NearbyCache {
  ts: number;
  center: { lat: number; lng: number };
  results: SearchItem[];
}

export function setNearbyCache(data: NearbyCache) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function getNearbyCache(): NearbyCache | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NearbyCache;
  } catch {
    return null;
  }
}
