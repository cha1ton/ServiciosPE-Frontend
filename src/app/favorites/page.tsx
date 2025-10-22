// frontend/src/app/favorites/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { FavoritesService } from "@/lib/favorites";
import { getLocalServiceDetail } from "@/lib/search";
import { useGeolocation } from "@/hooks/useGeolocation";
import ResultCard from "@/components/Home/ResultCard";
import type { SearchItem } from "@/lib/search";

type LatLng = { lat: number; lng: number };

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const { coordinates, getCurrentLocation, loading: geoLoading } = useGeolocation();

  const [ids, setIds] = useState<string[]>([]);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState("");

  // Guard: requiere sesión
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Obtener ubicación (para el botón "Cómo llegar" de las cards)
  useEffect(() => {
    if (!coordinates && !geoLoading) getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar IDs favoritos
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        setFetching(true);
        setErr("");
        const { favorites } = await FavoritesService.listMine();
        setIds(favorites);
      } catch (e: any) {
        setErr(e?.message || "Error obteniendo favoritos");
      } finally {
        setFetching(false);
      }
    })();
  }, [isAuthenticated]);

  // Con IDs en mano, obtener detalles de cada servicio (solo locales)
  useEffect(() => {
    if (!ids.length) { setItems([]); return; }
    (async () => {
      try {
        setFetching(true);
        const details = await Promise.all(
          ids.map(async (id) => {
            try {
              const { success, service } = await getLocalServiceDetail(id);
              if (!success || !service) return null;

              // Armar un SearchItem compatible con ResultCard
              const imgUrl = (service.images?.[0]?.url) || "";
              const coords = service.address?.coordinates;
              if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number") return null;

              const it: SearchItem = {
                source: "serviciospe",
                id: service.id,
                name: service.name,
                category: service.category || "otros",
                coordinates: { lat: coords.lat, lng: coords.lng },
                address: {
                  formatted: service.address?.formatted || "",
                  street: service.address?.street || "",
                  district: service.address?.district || "",
                  city: service.address?.city || "",
                },
                rating: service.rating || { average: 0, count: 0 },
                contact: service.contact || {},
                image: imgUrl,
                distanceMeters: 0, // opcional (no calculamos aquí)
                createdAt: service.createdAt,
              };
              return it;
            } catch {
              return null;
            }
          })
        );

        setItems(details.filter(Boolean) as SearchItem[]);
      } catch (e: any) {
        setErr(e?.message || "Error cargando detalles de favoritos");
      } finally {
        setFetching(false);
      }
    })();
  }, [ids]);

  // CTA para ir a registrar/editar desde esta vista
  const ctaLabel = useMemo(
    () => (user?.role === "provider" ? "Editar mi negocio" : "Registrar mi negocio"),
    [user?.role]
  );
  const ctaHref = useMemo(
    () => (user?.role === "provider" ? "/my-business/edit" : "/register-business"),
    [user?.role]
  );

  if (loading || !isAuthenticated) {
    return (
      <div>
        <Navbar />
        <main style={{ padding: 16 }}>
          <p>Cargando…</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main style={{ padding: 16, maxWidth: 960, margin: "0 auto" }}>
        <header style={{ marginBottom: 12 }}>
          <h1 style={{ margin: 0 }}>Mis favoritos</h1>
          <p style={{ margin: "6px 0 0", color: "#555" }}>
            Aquí verás los negocios que marcaste como favoritos (ServiciosPE).
          </p>
        </header>

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

        {fetching && <div>Cargando favoritos…</div>}
        {err && <div style={{ color: "#a00" }}>{err}</div>}

        {!fetching && items.length === 0 && (
          <div
            style={{
              padding: 12,
              border: "1px dashed #ddd",
              borderRadius: 12,
              background: "#fff",
              color: "#666",
            }}
          >
            Aún no tienes favoritos. Visita un negocio local y pulsa “♡ Añadir a favoritos”.
          </div>
        )}

        <section style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {items.map((it) => (
            <ResultCard
              key={it.id}
              item={it}
              origin={coordinates as LatLng | undefined} // para “Cómo llegar”
            />
          ))}
        </section>
      </main>
    </div>
  );
}
