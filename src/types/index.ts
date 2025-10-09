// frontend/src/types/index.ts

export interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
  nickname?: string;
  customPhoto?: string;
  role: 'user' | 'provider' | 'admin';
  createdAt?: string; // ✅
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}