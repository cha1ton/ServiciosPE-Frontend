// frontend/src/lib/reviews.ts

import { api } from "./api";

export interface ReviewPayload {
  rating: number;
  comment: string;
}

export const ReviewsService = {
  async list(serviceId: string) {
    const { data } = await api.get(`/reviews/${serviceId}`);
    return data as {
      success: boolean;
      reviews: any[];
      canReply?: boolean;
      replyEditWindowMinutes?: number;
    };
  },
  async create(serviceId: string, payload: ReviewPayload) {
    const { data } = await api.post(`/reviews/${serviceId}`, payload);
    return data;
  },
  // NUEVO: responder/editar
  async reply(reviewId: string, text: string) {
    const { data } = await api.post(`/reviews/reply/${reviewId}`, { text });
    return data;
  },
  // Obtener respuestas no leídas para el usuario
  async unread() {
    const { data } = await api.get(`/reviews/unread`);
    // data.items: [{ type: 'owner_reply'|'new_review', ... }]
    return data as { success: boolean; items: any[]; count: number };
  },
  // Marcar respuesta como leída
  async markRead(reviewId: string) {
    const { data } = await api.post(`/reviews/mark-read/${reviewId}`);
    return data;
  }
  ,
  // Marcar vista por owner
  async markOwnerSeen(reviewId: string) {
    const { data } = await api.post(`/reviews/mark-owner-seen/${reviewId}`);
    return data;
  }
};

