// frontend/src/lib/auth.ts
import { api } from "./api";
import { User, AuthResponse } from "@/types";

export class AuthService {
  // Iniciar login con Google
  static loginWithGoogle(): void {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`;
  }

  // Guardar token en localStorage
  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  // Obtener token
  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  // Remover token (logout)
  static removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  // Verificar autenticación
  static async verifyAuth(): Promise<User | null> {
    try {
      const response = await api.get<AuthResponse>("/auth/verify");
      return response.data.user || null;
    } catch (error) {
      this.removeToken();
      return null;
    }
  }

  // Obtener perfil de usuario
  static async getProfile(): Promise<User> {
    const response = await api.get<AuthResponse>("/auth/profile");
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.user!;
  }

  // Actualizar perfil
  static async updateProfile(profileData: { 
  nickname?: string; 
  profilePhoto?: File 
}): Promise<User> {
  
  const formData = new FormData();
  
  if (profileData.nickname !== undefined) {
    formData.append('nickname', profileData.nickname);
  }
  
  if (profileData.profilePhoto instanceof File) {
    formData.append('profilePhoto', profileData.profilePhoto);
  }

  const response = await api.put<AuthResponse>('/auth/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.user!;
}

  // Cerrar sesión
  static async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error durante logout:", error);
    } finally {
      this.removeToken();
    }
  }
}
