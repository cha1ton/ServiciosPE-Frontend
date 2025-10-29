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
        // Intentar refrescar geolocalización justo después de iniciar sesión
        try {
          if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            const done = (coords?: GeolocationCoordinates) => {
              if (coords) {
                try {
                  sessionStorage.setItem(
                    'last_coords',
                    JSON.stringify({ lat: coords.latitude, lng: coords.longitude, ts: Date.now() })
                  );
                } catch {}
              }
              router.push('/');
            };
            const onSuccess = (pos: GeolocationPosition) => done(pos.coords);
            const onError = () => done();
            navigator.geolocation.getCurrentPosition(onSuccess, onError, {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 0,
            });
            // Fallback por si el navegador no responde
            setTimeout(() => router.push('/'), 9000);
          } else {
            router.push('/');
          }
        } catch {
          router.push('/');
        }
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
