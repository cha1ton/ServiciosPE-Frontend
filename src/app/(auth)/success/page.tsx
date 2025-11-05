// src/app/(auth)/success/page.tsx
'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

function SuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { refreshUser } = useAuth();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const handle = async () => {
      if (!token) { router.replace('/login'); return; }

      AuthService.setToken(token);
      try {
        await refreshUser(); // llamado 1 sola vez
      } catch {
        AuthService.removeToken();
        router.replace('/login');
        return;
      }

      const finish = () => router.replace('/');

      try {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          const tid = window.setTimeout(finish, 9000);
          navigator.geolocation.getCurrentPosition(
            pos => { try {
              sessionStorage.setItem('last_coords', JSON.stringify({
                lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now(),
              })); } catch {} 
              clearTimeout(tid); finish();
            },
            () => { clearTimeout(tid); finish(); },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
          );
        } else {
          finish();
        }
      } catch {
        finish();
      }
    };

    void handle();
  }, [token, router]); // ← sin refreshUser aquí

  return (
    <div>
      <h2>Iniciando sesión...</h2>
      <p>Por favor espera un momento.</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div><h2>Iniciando sesión...</h2><p>Por favor espera un momento.</p></div>}>
      <SuccessInner />
    </Suspense>
  );
}
