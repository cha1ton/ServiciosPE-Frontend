// frontend/src/lib/search.ts

import { api } from "./api";

export interface SearchParams {
  lat: number;
  lng: number;
  radius?: number;       // m
  category?: string;     // restaurante, etc.
  openNow?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}

export interface SearchItem {
  id: string;
  name: string;
  category: string;
  distanceMeters: number;
  coordinates: { lat: number; lng: number };
  address: { formatted?: string; street?: string; district?: string; city?: string };
  rating: { average: number; count: number };
  contact?: { phone?: string; email?: string; website?: string };
  image?: string; // data URL
  createdAt?: string;
}

export interface SearchResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  results: SearchItem[];
}

export class SearchService {
  static async search(params: SearchParams): Promise<SearchResponse> {
    const query = new URLSearchParams();
    query.set("lat", String(params.lat));
    query.set("lng", String(params.lng));
    if (params.radius)   query.set("radius", String(params.radius));
    if (params.category) query.set("category", params.category);
    if (params.openNow)  query.set("openNow", "1");
    if (params.q)        query.set("q", params.q);
    if (params.page)     query.set("page", String(params.page));
    if (params.limit)    query.set("limit", String(params.limit));

    const { data } = await api.get<SearchResponse>(`/services/search?${query.toString()}`);
    return data;
  }
}
