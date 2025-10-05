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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Iniciando sesión...</h2>
        <p>Por favor espera un momento.</p>
      </div>
    </div>
  );
}