// src/app/(auth)/success/page.tsx
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/auth';

function SuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const handleSuccess = async () => {
      if (token) {
        AuthService.setToken(token);
        try {
          if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            const done = (coords?: GeolocationCoordinates) => {
              if (coords) {
                try {
                  sessionStorage.setItem(
                    'last_coords',
                    JSON.stringify({
                      lat: coords.latitude,
                      lng: coords.longitude,
                      ts: Date.now(),
                    })
                  );
                } catch {}
              }
              router.push('/');
            };
            navigator.geolocation.getCurrentPosition(
              (pos) => done(pos.coords),
              () => done(),
              { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
            // Fallback si el navegador no responde
            setTimeout(() => router.push('/'), 9000);
          } else {
            router.push('/');
          }
        } catch {
          router.push('/');
        }
      } else {
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

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div>
          <h2>Iniciando sesión...</h2>
          <p>Por favor espera un momento.</p>
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
