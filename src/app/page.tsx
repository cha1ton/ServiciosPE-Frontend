// frontend/src/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Layout/Navbar";
import { useGeolocation } from "@/hooks/useGeolocation";
import CategoryChips, { CategoryKey } from "@/components/Home/CategoryChips";
import SearchBar from "@/components/Home/SearchBar";
import ResultCard from "@/components/Home/ResultCard";
import { SearchItem, SearchService } from "@/lib/search";
import { setNearbyCache } from '@/lib/searchCache';

type DistanceOption = 500 | 1000 | 2000 | 5000;

export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const { coordinates, getCurrentLocation, loading: geoLoading, error: geoError } = useGeolocation();

  // Estado de filtros / consulta
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey | "">("");
  const [distance, setDistance] = useState<DistanceOption>(500); // ✅ 500 m por defecto
  const [openNow, setOpenNow] = useState(false);

  // Estado de resultados
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Pedir ubicación al entrar (una sola vez)
  useEffect(() => {
    if (!coordinates && !geoLoading) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CTA proveedor / usuario (hooks antes de cualquier return)
  const ctaLabel = useMemo(
    () => (user?.role === "provider" ? "Editar mi negocio" : "Registrar mi negocio"),
    [user?.role]
  );
  const ctaHref = useMemo(
    () => (user?.role === "provider" ? "/my-business/edit" : "/register-business"),
    [user?.role]
  );

  // Buscar manual (cuando el usuario presiona el botón “Buscar”)
  const handleSearch = async () => {
    if (!coordinates) return;
    setSearching(true);
    setErrorMsg("");
    try {
      const resp = await SearchService.search({
        lat: coordinates.lat,
        lng: coordinates.lng,
        radius: distance,
        category: category || undefined,
        openNow,
        q: query || undefined,
        page: 1,
        limit: 20,
      });
      setResults(resp.results);
      // guarda caché para detalle
      setNearbyCache({
        ts: Date.now(),
        center: { lat: coordinates.lat, lng: coordinates.lng },
        results: resp.results,
      });
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.response?.data?.message || e?.message || "Error buscando servicios");
    } finally {
      setSearching(false);
    }
  };

  // 🔹 AUTO-FEED: cuando haya coords o cambien filtros básicos, trae cercanos SIN q (lista inicial)
  useEffect(() => {
    const run = async () => {
      if (!coordinates) return;
      setSearching(true);
      setErrorMsg("");
      try {
        const resp = await SearchService.search({
          lat: coordinates.lat,
          lng: coordinates.lng,
          radius: distance,
          category: category || undefined,
          openNow,
          // 👇 Sin q: esto muestra lugares (tus servicios + Google) cercanos por defecto
          page: 1,
          limit: 20,
        });
        setResults(resp.results);
        // guarda caché para detalle
        setNearbyCache({
          ts: Date.now(),
          center: { lat: coordinates.lat, lng: coordinates.lng },
          results: resp.results,
        });
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e?.response?.data?.message || e?.message || "Error cargando cercanos");
      } finally {
        setSearching(false);
      }
    };
    run();
    // Actualiza cuando cambien coords, distancia, categoría u “abierto ahora”
  }, [coordinates?.lat, coordinates?.lng, distance, category, openNow]);

  // Carga / no autenticado
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

        {/* Buscador (si escribes texto y das “Buscar”, sobreescribe la lista) */}
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

        {/* Resultados */}
        <section style={{ marginTop: 20, display: "grid", gap: 12 }}>
          {searching && <div>Buscando…</div>}
          {errorMsg && <div style={{ color: "#a00" }}>{errorMsg}</div>}

          {!searching && results.length === 0 && (
            <div
              style={{
                padding: 12,
                border: "1px dashed #ddd",
                borderRadius: 12,
                background: "#fff",
                color: "#666",
              }}
            >
              {coordinates
                ? "No encontramos resultados en esta zona y filtros."
                : "Autoriza la ubicación para ver lugares cercanos."}
            </div>
          )}

          {results.map((it) => (
            <ResultCard key={it.id} item={it} origin={coordinates ?? undefined} />
          ))}
        </section>
      </main>
    </div>
  );
}
