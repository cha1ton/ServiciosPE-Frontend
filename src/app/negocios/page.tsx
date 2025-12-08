// frontend/src/app/negocios/page.tsx
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

  
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey | "">("");
  const [distance, setDistance] = useState<DistanceOption>(500);
  const [openNow, setOpenNow] = useState(false);

  
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  
  
  const [locationBadgeCollapsed, setLocationBadgeCollapsed] = useState(false);

  
  const [categoryCounts, setCategoryCounts] = useState<Record<CategoryKey, number>>({
    restaurante: 0,
    comida_bebidas: 0,
    centro_salud: 0,
    farmacia: 0,
    veterinaria: 0,
    supermercado: 0,
    hotel: 0,
    gimnasio: 0,
    lavanderia: 0,
    barberia: 0,
    salon_belleza: 0,
    taller_mecanico: 0,
    discoteca: 0,
    otros: 0,
  });

  
  const returningMessages = [
    "¡Hola de nuevo!",
    "¿Qué buscas hoy?",
    "Bienvenido nuevamente",
    "¡Qué bueno verte!",
    "¿Listo para explorar?",
  ];

  
  useEffect(() => {
    if (!coordinates && !geoLoading) {
      getCurrentLocation();
    }
  }, []);

  
  useEffect(() => {
    if (!loading && isAuthenticated) {
      getCurrentLocation();
    }
  }, [loading, isAuthenticated]);

  //  mensaje de bienvenida 
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      
      if (!hasSeenWelcome) {
        
        const isFirstTime = localStorage.getItem('isFirstTimeUser');
        
        if (isFirstTime === 'true') {
          //  mensaje de bienvenida especial
          setWelcomeMessage("¡Bienvenido a ServiciosPE! 🎉");
          localStorage.removeItem('isFirstTimeUser'); // Limpiar flag
        } else {
          // mensaje rotativo aleatorio
          const randomMessage = returningMessages[Math.floor(Math.random() * returningMessages.length)];
          setWelcomeMessage(`${randomMessage} ${user.nickname || user.name}`);
        }
        
        setShowWelcomeMessage(true);
        sessionStorage.setItem('hasSeenWelcome', 'true');
        
        
        const timer = setTimeout(() => {
          setShowWelcomeMessage(false);
        }, 4000);
        
        return () => clearTimeout(timer);
      }
    }
    
  }, [loading, isAuthenticated, user]);

  
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

  
  useEffect(() => {
    const loadAllForCounting = async () => {
      if (!coordinates) return;
      
      const counts: Record<CategoryKey, number> = {
        restaurante: 0,
        comida_bebidas: 0,
        centro_salud: 0,
        farmacia: 0,
        veterinaria: 0,
        supermercado: 0,
        hotel: 0,
        gimnasio: 0,
        lavanderia: 0,
        barberia: 0,
        salon_belleza: 0,
        taller_mecanico: 0,
        discoteca: 0,
        otros: 0,
      };

      try {
        
        const categories: CategoryKey[] = [
          "restaurante",
          "comida_bebidas", 
          "centro_salud",
          "farmacia",
          "veterinaria",
          "supermercado",
          "hotel",
          "gimnasio",
          "lavanderia",
          "barberia",
          "salon_belleza",
          "taller_mecanico",
          "discoteca",
          "otros"
        ];

        
        const promises = categories.map(cat => 
          SearchService.search({
            lat: coordinates.lat,
            lng: coordinates.lng,
            radius: distance,
            category: cat,
            page: 1,
            limit: 100, 
          }).catch(err => {
            console.error(`Error buscando ${cat}:`, err);
            return { results: [] };
          })
        );

        const results = await Promise.all(promises);

        
        categories.forEach((cat, index) => {
          counts[cat] = results[index].results?.length || 0;
        });

        setCategoryCounts(counts);
      } catch (e) {
        console.error("Error contando categorías:", e);
      }
    };

    loadAllForCounting();
  }, [coordinates?.lat, coordinates?.lng, distance]);

  
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

      {/* ubicación flotante  */}
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
          
        </div>
      )}

      {/* Mensaje de bienvenida */}
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
        {/* Estado de geolocalización */}
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

        {}
        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>
            Descubre Servicios <span className={styles.heroHighlight}>Cerca de Ti</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Encuentra restaurantes, farmacias, hoteles y más en tu zona
          </p>
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

        {/* Filtros por categoría*/}
        <CategoryChips
          selected={category || ""}
          onSelect={(k) => setCategory(k === category ? "" : k)}
          counts={categoryCounts}
        />

        {}
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

        {}
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
                  {/* {provider === "monetag" && i === 2 && (
                    <div className={styles.adCard}>
                      <DirectLinkCard
                        href={DIRECT_LINK_FEED}
                        title="Publicidad recomendada"
                        text="Anuncio relevante para tu búsqueda."
                      />
                    </div>
                  )} */}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}