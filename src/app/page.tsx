// src/app/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Layout/Navbar';

export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Bienvenido, {user?.nickname || user?.name}!</h1>
          
          {/* Aquí irá el buscador y chat IA después */}
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p>🚧 Buscador de servicios y chat IA (próximamente)</p>
          </div>
          <div className="h-[1000px] bg-gray-50">
  Contenido de prueba para forzar scroll
</div>

        </div>
      </main>
    </div>
  );
}