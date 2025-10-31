// src/app/(auth)/success/page.tsx
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

function SuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { refreshUser } = useAuth();

  useEffect(() => {
    let isCancelled = false;
    let timeoutId: number | null = null;

    const handleSuccess = async () => {
      if (token) {
        AuthService.setToken(token);
        try {
          await refreshUser();
        } catch (err) {
          console.error('Error refrescando usuario tras login:', err);
          AuthService.removeToken();
          router.replace('/login');
          return;
        }

        const finish = () => {
          if (!isCancelled) {
            router.replace('/');
          }
        };

        try {
          if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            const done = (coords?: GeolocationCoordinates) => {
              if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
                timeoutId = null;
              }
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
              finish();
            };

            timeoutId = window.setTimeout(() => finish(), 9000);

            navigator.geolocation.getCurrentPosition(
              (pos) => done(pos.coords),
              () => done(),
              { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
          } else {
            finish();
          }
        } catch {
          finish();
        }
      } else {
        router.replace('/login');
      }
    };

    handleSuccess();
    return () => {
      isCancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [token, router, refreshUser]);

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
