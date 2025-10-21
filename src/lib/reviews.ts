// frontend/src/lib/reviews.ts

import { api } from "./api";

export interface ReviewPayload {
  rating: number;     // 1..5
  comment: string;    // <= 200
}

export class ReviewsService {
  static async list(serviceId: string) {
    const { data } = await api.get(`/reviews/${serviceId}`);
    return data; // { success, reviews: [...] }
  }

  static async create(serviceId: string, payload: ReviewPayload) {
    const { data } = await api.post(`/reviews/${serviceId}`, payload);
    return data; // { success, review }
  }
}
