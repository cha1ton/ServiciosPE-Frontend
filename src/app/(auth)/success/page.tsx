// src/app/(auth)/success/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/auth';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const handleSuccess = async () => {
      if (token) {
        AuthService.setToken(token);
        // Redirigir a la página principal después del login
        router.push('/');
      } else {
        // Si no hay token, redirigir al login
        router.push('/login');
      }
    };

    handleSuccess();
  }, [token, router]);

  return (
    <div>
      <div>
        <h2>Iniciando sesión...</h2>
        <p>Por favor espera un momento.</p>
      </div>
    </div>
  );
}