// src/app/(auth)/login/page.tsx

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import Link from "next/link";

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
          <button onClick={login}>Continuar con Google</button>
          <p style={{ marginTop: 12, fontSize: 13, color: "#666" }}>
            Al continuar aceptas nuestra{" "}
            <Link href="/privacy" style={{ textDecoration: "underline" }}>
              Política de Privacidad
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}