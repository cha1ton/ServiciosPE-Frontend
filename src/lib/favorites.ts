// frontend/src/lib/favorites.ts

import { api } from "./api";

export class FavoritesService {
  static async listMine(): Promise<{ favorites: string[] }> {
    const { data } = await api.get('/user/favorites');
    return data;
  }

  static async toggle(serviceId: string): Promise<{ isFavorite: boolean }> {
    const { data } = await api.post(`/user/favorites/${serviceId}/toggle`);
    return data;
  }
}
