// src/app/(auth)/success/page.tsx
'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import styles from './page.module.css';

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
        await refreshUser();
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
  }, [token, router]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.iconContainer}>
          <img 
            src="https://cdn-icons-gif.flaticon.com/6844/6844338.gif" 
            alt="Ubicación" 
            className={styles.locationGif}
          />
        </div>

        <h2 className={styles.title}>Iniciando sesión...</h2>
        <p className={styles.subtitle}>Estamos preparando todo para ti</p>

        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>

        <p className={styles.hint}>Detectando tu ubicación para mejores resultados</p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.iconContainer}>
            <img 
              src="https://cdn-icons-gif.flaticon.com/6844/6844338.gif" 
              alt="Ubicación" 
              className={styles.locationGif}
            />
          </div>
          <h2 className={styles.title}>Iniciando sesión...</h2>
          <p className={styles.subtitle}>Por favor espera un momento</p>
        </div>
      </div>
    }>
      <SuccessInner />
    </Suspense>
  );
}