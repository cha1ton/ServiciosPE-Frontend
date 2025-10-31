// src/app/(auth)/login/page.tsx

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const hasToken = !!AuthService.getToken();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || hasToken) {
    return (
      <div>
        <p>Iniciando sesión...</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <h1>ServiciosPE</h1>
          <p>Encuentra servicios cercanos en Perú</p>
        </div>
        
        <div>
          <button
            onClick={login}
          >
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  );
}