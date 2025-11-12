// frontend/src/hooks/useAuth.tsx
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@/types';
import { AuthService } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }){
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = AuthService.getToken();
      if (token) {
        const userData = await AuthService.verifyAuth();
        setUser(userData);
        
        // ✅ SOLUCIÓN SIN BACKEND: Detectar usuario nuevo usando localStorage
        if (userData && userData.id) {
          const userFirstSeen = localStorage.getItem(`user_first_seen_${userData.id}`);
          
          if (!userFirstSeen) {
            // Es la primera vez que vemos a este usuario en este navegador
            localStorage.setItem(`user_first_seen_${userData.id}`, new Date().toISOString());
            localStorage.setItem('isFirstTimeUser', 'true');
            console.log('👋 Usuario nuevo detectado (primera vez en este navegador)');
          } else {
            // Ya vimos a este usuario antes
            console.log('👤 Usuario recurrente (visto por primera vez el:', userFirstSeen, ')');
          }
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      AuthService.removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    AuthService.loginWithGoogle();
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    // Limpiar flag de sesión (pero mantener el registro de primera vez)
    sessionStorage.removeItem('hasSeenWelcome');
  };

  const refreshUser = async () => {
    try {
      const userData = await AuthService.getProfile();
      setUser(userData);
      console.log('✅ Usuario refrescado:', userData);
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}