// src/app/(auth)/login/page.tsx

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import Link from "next/link";
import { Store, ShoppingBag, UtensilsCrossed, Wrench } from 'lucide-react';
import styles from './login.module.css';

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
      <div className={styles.loadingScreen}>
        <p>Iniciando sesión...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.centerWrap}>
        <div className={styles.card}>
          {}
          <div className={styles.leftSection}>
            <div className={styles.planetContainer}>
              <img 
                src="https://i.pinimg.com/originals/d7/ae/01/d7ae0170d3d5ffcbaa7f02fdda387a3b.gif" 
                alt="Animated Planet" 
                className={styles.planetGif}
              />
            </div>

            <div className={styles.serviceIcons}>
              <div className={styles.serviceIcon}>
                <div className={styles.serviceIconCircle}>
                  <Store size={32} strokeWidth={1.5} />
                </div>
                <div className={styles.serviceIconLabel}>Tienda</div>
              </div>
              <div className={styles.serviceIcon}>
                <div className={styles.serviceIconCircle}>
                  <ShoppingBag size={32} strokeWidth={1.5} />
                </div>
                <div className={styles.serviceIconLabel}>Mercado</div>
              </div>
              <div className={styles.serviceIcon}>
                <div className={styles.serviceIconCircle}>
                  <UtensilsCrossed size={32} strokeWidth={1.5} />
                </div>
                <div className={styles.serviceIconLabel}>Restaurante</div>
              </div>
              <div className={styles.serviceIcon}>
                <div className={styles.serviceIconCircle}>
                  <Wrench size={32} strokeWidth={1.5} />
                </div>
                <div className={styles.serviceIconLabel}>Servicios</div>
              </div>
            </div>
          </div>

          {}
          <div className={styles.rightSection}>
            <div className={styles.logo}>ServiciosPE</div>
            <h2 className={styles.welcomeTitle}>Bienvenido</h2>
            <p className={styles.welcomeText}>
              Usa tu cuenta para continuar. No hay campos, no hay drama.
            </p>

            <button onClick={login} className={styles.googleBtn} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.8 10.2273C19.8 9.52045 19.7364 8.83636 19.6182 8.18182H10V12.05H15.4818C15.2364 13.3 14.5182 14.3591 13.4545 15.0682V17.5773H16.7636C18.6727 15.8364 19.8 13.2727 19.8 10.2273Z" fill="#4285F4"/>
                <path d="M10 20C12.7 20 14.9636 19.1045 16.7636 17.5773L13.4545 15.0682C12.5545 15.6682 11.3864 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.2636 4.40455 11.9H0.995454V14.4909C2.78636 18.0591 6.10909 20 10 20Z" fill="#34A853"/>
                <path d="M4.40455 11.9C4.19091 11.3 4.06818 10.6591 4.06818 10C4.06818 9.34091 4.19091 8.7 4.40455 8.1V5.50909H0.995454C0.318182 6.85909 0 8.38636 0 10C0 11.6136 0.318182 13.1409 0.995454 14.4909L4.40455 11.9Z" fill="#FBBC05"/>
                <path d="M10 3.97727C11.5136 3.97727 12.8682 4.48182 13.9318 5.47273L16.8727 2.53182C14.9591 0.786364 12.6955 0 10 0C6.10909 0 2.78636 1.94091 0.995454 5.50909L4.40455 8.1C5.19091 5.73636 7.39545 3.97727 10 3.97727Z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>

            <div className={styles.terms}>
              Al continuar aceptas los{" "}
              <Link href="/terms" className={styles.link}>
                Términos
              </Link>{" "}
              y la{" "}
              <Link href="/privacy" className={styles.link}>
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}