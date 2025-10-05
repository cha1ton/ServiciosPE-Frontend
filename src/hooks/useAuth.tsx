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
  refreshUser: () => Promise<void>; // ← Agregado aquí
  
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
    refreshUser, // ← Agregado aquí también
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
