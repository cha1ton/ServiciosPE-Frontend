// frontend/src/app/favorites/page.tsx
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { FavoritesService } from "@/lib/favorites";
import { getLocalServiceDetail } from "@/lib/search";
import { useGeolocation } from "@/hooks/useGeolocation";
import ResultCard from "@/components/Home/ResultCard";
import { Heart, Search } from "lucide-react";
import type { SearchItem } from "@/lib/search";
import styles from './favorites.module.css';

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

  // Obtener ubicación
  useEffect(() => {
    if (!coordinates && !geoLoading) getCurrentLocation();
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

  // Obtener detalles de cada servicio
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
                distanceMeters: 0,
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

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Cargando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.titleWrapper}>
            <div className={styles.heartIcon}>
              <Heart fill="white" />
            </div>
            <h1 className={styles.title}>Mis Favoritos</h1>
          </div>
          <p className={styles.subtitle}>
            Aquí verás los negocios que marcaste como favoritos en ServiciosPE
          </p>
        </header>

        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{items.length}</span>
            <span className={styles.statLabel}>Negocios favoritos</span>
          </div>
        </div>

        {err && <div className={styles.errorMessage}>{err}</div>}

        {fetching && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Cargando favoritos...</p>
          </div>
        )}

        {!fetching && items.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💔</div>
            <h2 className={styles.emptyTitle}>Aún no tienes favoritos</h2>
            <p className={styles.emptyText}>
              Visita un negocio local y pulsa el corazón para añadirlo a tus favoritos.
              ¡Así podrás encontrarlo fácilmente después!
            </p>
            <button
              onClick={() => router.push('/')}
              className={styles.emptyButton}
            >
              <Search size={18} style={{ marginRight: 8 }} />
              Explorar Negocios
            </button>
          </div>
        )}

        {!fetching && items.length > 0 && (
          <div className={styles.resultsGrid}>
            {items.map((it) => (
              <ResultCard
                key={it.id}
                item={it}
                origin={coordinates as LatLng | undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}