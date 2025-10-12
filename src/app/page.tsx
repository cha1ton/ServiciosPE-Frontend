// frontend/src/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Layout/Navbar";
import { useGeolocation } from "@/hooks/useGeolocation";
import CategoryChips, { CategoryKey } from "@/components/Home/CategoryChips";
import SearchBar from "@/components/Home/SearchBar";

type DistanceOption = 500 | 1000 | 2000 | 5000;

export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const { coordinates, getCurrentLocation, loading: geoLoading, error: geoError } = useGeolocation();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey | "">("");
  const [distance, setDistance] = useState<DistanceOption>(1000);
  const [openNow, setOpenNow] = useState(false);

  // Redirección a login si no está autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Pide ubicación al entrar (solo una vez)
  useEffect(() => {
    if (!coordinates && !geoLoading) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⚠️ HOOKS SIEMPRE ANTES DE CUALQUIER RETURN
  const ctaLabel = useMemo(
    () => (user?.role === "provider" ? "Editar mi negocio" : "Registrar mi negocio"),
    [user?.role]
  );
  const ctaHref = useMemo(
    () => (user?.role === "provider" ? "/my-business/edit" : "/register-business"),
    [user?.role]
  );

  const handleSearch = () => {
    console.log("🔎 Buscar con:", {
      query,
      category,
      distance,
      openNow,
      coords: coordinates || "(sin coords)",
    });
    alert(
      `Buscar:\n- q: ${query || "(vacío)"}\n- cat: ${category || "(todas)"}\n- dist: ${distance} m\n- openNow: ${openNow ? "sí" : "no"}\n- coords: ${
        coordinates ? `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}` : "no disponibles"
      }`
    );
  };

  // Ahora sí puedes retornar condicionalmente, ya llamaste todos los hooks
  if (loading || !isAuthenticated) {
    return (
      <div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <main style={{ padding: "16px", maxWidth: 960, margin: "0 auto" }}>
        <header style={{ marginBottom: 12 }}>
          <h1 style={{ margin: 0 }}>Bienvenido, {user?.nickname || user?.name}!</h1>
          <p style={{ margin: "6px 0 0", color: "#555" }}>
            Encuentra servicios cercanos en Perú. Precisión primero: tu ubicación es la base.
          </p>
        </header>

        {/* CTA proveedor / usuario */}
        <div style={{ margin: "12px 0 16px" }}>
          <button
            onClick={() => router.push(ctaHref)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#f7f7f8",
              cursor: "pointer",
            }}
          >
            {ctaLabel} →
          </button>
        </div>

        {/* Estado de geolocalización */}
        <div
          style={{
            padding: "10px 12px",
            border: "1px solid #eee",
            borderRadius: 12,
            background: "#fafafa",
            marginBottom: 12,
            fontSize: 14,
          }}
        >
          {geoLoading && <span>📍 Obteniendo ubicación…</span>}
          {!geoLoading && coordinates && (
            <span>
              📍 Ubicación: <b>{coordinates.lat.toFixed(5)}</b>, <b>{coordinates.lng.toFixed(5)}</b>
            </span>
          )}
          {!geoLoading && !coordinates && (
            <div>
              <span style={{ color: "#a00" }}>No pudimos obtener tu ubicación.</span>{" "}
              <button
                onClick={getCurrentLocation}
                style={{ textDecoration: "underline", cursor: "pointer", background: "transparent", border: "none" }}
              >
                Reintentar
              </button>
              {geoError && <div style={{ color: "#a00" }}>{geoError}</div>}
            </div>
          )}
        </div>

        {/* Buscador */}
        <SearchBar
          value={query}
          onChange={setQuery}
          distance={distance}
          onDistanceChange={setDistance}
          openNow={openNow}
          onToggleOpen={setOpenNow}
          onSubmit={handleSearch}
          disabled={!coordinates}
        />

        {/* Filtros por categoría */}
        <CategoryChips
          selected={category || ""}
          onSelect={(k) => setCategory(k === category ? "" : k)}
          style={{ marginTop: 12 }}
        />

        {/* Placeholder de resultados / mapa */}
        <section style={{ marginTop: 20, padding: 12, border: "1px dashed #ddd", borderRadius: 12, background: "#fff" }}>
          <p style={{ margin: 0, color: "#666" }}>
            Aquí irá la lista + mapa de resultados. Cuando tengas el endpoint, conecta el botón <b>Buscar</b> con tu API.
          </p>
        </section>
      </main>
    </div>
  );
}
