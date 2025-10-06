// src/app/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Layout/Navbar";

export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Navbar />

      <main>
        <div>
          <h1>Bienvenido, {user?.nickname || user?.name}!</h1>

          {/* Aquí irá el buscador y chat IA después */}
          <div>
            <p>🚧 Buscador de servicios y chat IA (próximamente)</p>
          </div>
          <div>Contenido de prueba para forzar scroll</div>
        </div>
      </main>
    </div>
  );
}
