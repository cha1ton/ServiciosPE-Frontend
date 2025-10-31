// frontend/src/components/AuthGate.tsx
'use client';
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { useEffect } from 'react';

export default function AuthGate({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const hasToken = !!AuthService.getToken();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !hasToken) router.replace('/login');
    }
  }, [loading, isAuthenticated, hasToken, router]);

  if (loading || (!isAuthenticated && hasToken)) {
    return <div><p>Cargando...</p></div>;
  }
  if (!isAuthenticated && !hasToken) return null;

  return <>{children}</>;
}
