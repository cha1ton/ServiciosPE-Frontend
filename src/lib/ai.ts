// frontend/src/lib/ai.ts

import { api } from "./api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatAction {
  type: "search";
  q?: string;
  category?: string;
  distance?: number;
  openNow?: boolean;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  usage?: any;
  cost?: any;
  action?: ChatAction; // 👈 opcional
}

export const AIService = {
  async chat(messages: ChatMessage[], context?: any) {
    const { data } = await api.post("/ai/chat", { messages, context });
    return data as ChatResponse;
  }
};
