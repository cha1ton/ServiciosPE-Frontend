// src/app/(auth)/login/page.tsx

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div>
        <p>Cargando...</p>
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