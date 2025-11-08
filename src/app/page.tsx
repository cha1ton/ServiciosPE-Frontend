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
import ChatWidget from "@/components/Chat/ChatWidget";
// import AuthGate from "@/components/AuthGate";
import DirectLinkCard from "@/components/Ads/DirectLinkCard";

const provider = process.env.NEXT_PUBLIC_ADS_PROVIDER;
const DIRECT_LINK_FEED = process.env.NEXT_PUBLIC_MONETAG_DIRECT_FEED ?? "";

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

  // Redirecci�n temprana eliminada: AuthGate y el guard con token se encargan

  // Pedir ubicación al entrar (una sola vez)
  useEffect(() => {
    if (!coordinates && !geoLoading) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pedir/actualizar ubicación cuando el usuario inicia sesión (cada login)
  useEffect(() => {
    if (!loading && isAuthenticated) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated]);

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

  // La redirección se maneja en AuthGate y al hidratar el usuario

  // gatea el render mientras hay token pero aún no se hidrata el user
  return (
    
    <div>
      <Navbar />

      <main style={{ padding: "16px", maxWidth: 960, margin: "0 auto" }}>

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

        <ChatWidget
          coords={coordinates || null}
          defaultDistance={distance}
          initialCategory={category || ""}
          onRunSearch={(opts) => {
            // Si el bot propone filtros, actualízalos y ejecuta la búsqueda
            if (opts.distance) setDistance(opts.distance as any);
            if (typeof opts.openNow === "boolean") setOpenNow(opts.openNow);
            if (typeof opts.category === "string") setCategory(opts.category as any);
            if (typeof opts.q === "string") setQuery(opts.q);

            // dispara la búsqueda con el estado actualizado
            // pequeño delay para asegurar setState
            setTimeout(() => handleSearch(), 0);
          }}
        />

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

          {results.map((item, i) => (
            <div key={`${item.source}:${item.id}`}>
              <ResultCard item={item} origin={coordinates ?? undefined} />
              {provider === "monetag" && i === 2 && (
                <div style={{ margin: "12px 0" }}>
                  <DirectLinkCard
                    href={DIRECT_LINK_FEED}
                    title="Publicidad recomendada"
                    text="Anuncio relevante para tu búsqueda."
                  />
                </div>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
    
  );
}
