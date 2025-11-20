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
import DirectLinkCard from "@/components/Ads/DirectLinkCard";
import { MapPin, X } from "lucide-react";
import styles from './negocios.module.css';

const provider = process.env.NEXT_PUBLIC_ADS_PROVIDER;
const DIRECT_LINK_FEED = process.env.NEXT_PUBLIC_MONETAG_DIRECT_FEED ?? "";

type DistanceOption = 500 | 1000 | 2000 | 5000;

export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const { coordinates, locationInfo, getCurrentLocation, loading: geoLoading, error: geoError } = useGeolocation();

  // Estado de filtros / consulta
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey | "">("");
  const [distance, setDistance] = useState<DistanceOption>(500);
  const [openNow, setOpenNow] = useState(false);

  // Estado de resultados
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Estado para mensajes temporales
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  
  // Estado para badge de ubicación contraído
  const [locationBadgeCollapsed, setLocationBadgeCollapsed] = useState(false);

  // Mensajes rotativos para usuarios recurrentes
  const returningMessages = [
    "¡Hola de nuevo!",
    "¿Qué buscas hoy?",
    "Bienvenido nuevamente",
    "¡Qué bueno verte!",
    "¿Listo para explorar?",
  ];

  // Pedir ubicación al entrar
  useEffect(() => {
    if (!coordinates && !geoLoading) {
      getCurrentLocation();
    }
  }, []);

  // Pedir/actualizar ubicación cuando el usuario inicia sesión
  useEffect(() => {
    if (!loading && isAuthenticated) {
      getCurrentLocation();
    }
  }, [loading, isAuthenticated]);

  // Determinar mensaje de bienvenida y mostrarlo
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Verificar si ya se mostró el mensaje en esta sesión
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      
      if (!hasSeenWelcome) {
        // Verificar si es la primera vez del usuario (registro reciente)
        const isFirstTime = localStorage.getItem('isFirstTimeUser');
        
        if (isFirstTime === 'true') {
          // Primera vez - mensaje de bienvenida especial
          setWelcomeMessage("¡Bienvenido a ServiciosPE! 🎉");
          localStorage.removeItem('isFirstTimeUser'); // Limpiar flag
        } else {
          // Usuario recurrente - mensaje rotativo aleatorio
          const randomMessage = returningMessages[Math.floor(Math.random() * returningMessages.length)];
          setWelcomeMessage(`${randomMessage} ${user.nickname || user.name}`);
        }
        
        setShowWelcomeMessage(true);
        sessionStorage.setItem('hasSeenWelcome', 'true');
        
        // Auto-ocultar después de 4 segundos
        const timer = setTimeout(() => {
          setShowWelcomeMessage(false);
        }, 4000);
        
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, user]);

  // Contraer badge de ubicación después de 5 segundos (solo cuando el nombre esté cargado)
  useEffect(() => {
    if (coordinates && locationInfo && locationInfo.district) {
      const timer = setTimeout(() => {
        setLocationBadgeCollapsed(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [coordinates, locationInfo]);

  const ctaLabel = useMemo(
    () => (user?.role === "provider" ? "Editar mi negocio" : "Registrar mi negocio"),
    [user?.role]
  );
  const ctaHref = useMemo(
    () => (user?.role === "provider" ? "/my-business/edit" : "/register-business"),
    [user?.role]
  );

  // Buscar manual
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

  // AUTO-FEED
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
          page: 1,
          limit: 20,
        });
        setResults(resp.results);
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
  }, [coordinates?.lat, coordinates?.lng, distance, category, openNow]);

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Badge de ubicación flotante en la esquina inferior izquierda */}
      {coordinates && (
        <div className={`${styles.locationBadge} ${locationBadgeCollapsed ? styles.collapsed : ''}`}>
          <MapPin size={14} />
          <span className={styles.locationBadgeText}>
            {locationInfo?.district 
              ? (locationInfo.city && locationInfo.district !== locationInfo.city
                  ? `${locationInfo.district}, ${locationInfo.city}`
                  : locationInfo.district)
              : (locationInfo?.city || 'Detectando ubicación...')}
          </span>
          {/* Coordenadas comentadas - descomentar si se necesitan para debug */}
          {/* <span className={styles.coords}>
            ({coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)})
          </span> */}
        </div>
      )}

      {/* Mensaje de bienvenida temporal (primera vez en la sesión) */}
      {showWelcomeMessage && welcomeMessage && (
        <div className={styles.welcomeMessage}>
          <div className={styles.welcomeMessageContent}>
            <span>{welcomeMessage}</span>
            <button 
              onClick={() => setShowWelcomeMessage(false)}
              className={styles.welcomeMessageClose}
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <main className={styles.main}>
        {/* Estado de geolocalización - SOLO MOSTRAR SI HAY ERROR O ESTÁ CARGANDO */}
        {(!coordinates || geoError) && (
          <div className={styles.locationBanner}>
            {geoLoading && (
              <div className={styles.locationContent}>
                <MapPin size={18} className={styles.locationIcon} />
                <span>Obteniendo ubicación...</span>
              </div>
            )}
            {!geoLoading && !coordinates && (
              <div className={styles.locationError}>
                <MapPin size={18} className={styles.locationIconError} />
                <span>No pudimos obtener tu ubicación.</span>
                <button onClick={getCurrentLocation} className={styles.retryButton}>
                  Reintentar
                </button>
                {geoError && <div className={styles.errorText}>{geoError}</div>}
              </div>
            )}
          </div>
        )}

        {/* Buscador PRIMERO */}
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
        />

        {/* Chat DESPUÉS del buscador */}
        <ChatWidget
          coords={coordinates || null}
          defaultDistance={distance}
          initialCategory={category || ""}
          onRunSearch={(opts) => {
            if (opts.distance) setDistance(opts.distance as any);
            if (typeof opts.openNow === "boolean") setOpenNow(opts.openNow);
            if (typeof opts.category === "string") setCategory(opts.category as any);
            if (typeof opts.q === "string") setQuery(opts.q);
            setTimeout(() => handleSearch(), 0);
          }}
        />

        {/* Resultados en GRID de 3 columnas */}
        <section className={styles.resultsSection}>
          {searching && (
            <div className={styles.loadingMessage}>
              <div className={styles.spinner}></div>
              <span>Buscando servicios...</span>
            </div>
          )}
          {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

          {!searching && results.length === 0 && (
            <div className={styles.emptyState}>
              {coordinates
                ? "No encontramos resultados en esta zona y filtros."
                : "Autoriza la ubicación para ver lugares cercanos."}
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className={styles.resultsGrid}>
              {results.map((item, i) => (
                <div key={`${item.source}:${item.id}`}>
                  <ResultCard item={item} origin={coordinates ?? undefined} />
                  {provider === "monetag" && i === 2 && (
                    <div className={styles.adCard}>
                      <DirectLinkCard
                        href={DIRECT_LINK_FEED}
                        title="Publicidad recomendada"
                        text="Anuncio relevante para tu búsqueda."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}