// frontend/src/components/Home/ResultCard.tsx

"use client";
import React from "react";
import { SearchItem } from "@/lib/search";
import { useRouter } from "next/navigation";
import { Eye, Navigation, Star, MapPin, ImageOff } from "lucide-react";
import styles from "./home.module.css";

type LatLng = { lat: number; lng: number };

function buildDirectionsUrl(
  origin: LatLng,
  dest: LatLng,
  mode: "walking" | "driving" | "transit" = "walking"
) {
  const o = `${origin.lat},${origin.lng}`;
  const d = `${dest.lat},${dest.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    o
  )}&destination=${encodeURIComponent(d)}&travelmode=${mode}`;
}

export default function ResultCard({
  item,
  origin,
}: {
  item: SearchItem;
  origin?: LatLng;
}) {
  const router = useRouter();
  const goDetail = () => {
    router.push(`/service/${item.source}/${item.id}`);
  };

  const hasOrigin =
    !!origin && typeof origin.lat === "number" && typeof origin.lng === "number";
  const hasDest =
    !!item.coordinates &&
    typeof item.coordinates.lat === "number" &&
    typeof item.coordinates.lng === "number";

  const directionsUrl =
    hasOrigin && hasDest ? buildDirectionsUrl(origin!, item.coordinates!) : "";

  return (
    <div className={styles.resultCard}>
      {/* Imagen */}
      <div className={styles.cardImage}>
        {item.image ? (
          <img src={item.image} alt={item.name} className={styles.cardImg} />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <ImageOff size={32} strokeWidth={1.5} />
            <span>Sin imagen</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className={styles.cardContent}>
        {/* Header con nombre y badges */}
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{item.name}</h3>
          <div className={styles.cardBadges}>
            <span className={styles.badge}>
              {item.source === "google" ? "Google" : "ServiciosPE"}
            </span>
            {item.category && (
              <span className={`${styles.badge} ${styles.badgeCategory}`}>
                {(item.category || "").replaceAll("_", " ")}
              </span>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div className={styles.cardAddress}>
          <MapPin size={14} />
          <span>
            {item.address?.formatted ||
              [item.address?.street, item.address?.district, item.address?.city]
                .filter(Boolean)
                .join(", ")}
          </span>
        </div>

        {/* Distancia y rating */}
        <div className={styles.cardMeta}>
          <span className={styles.cardDistance}>
            <MapPin size={14} />
            {Math.round(item.distanceMeters ?? 0)} m
          </span>
          <span className={styles.cardRating}>
            <Star size={14} fill="#fbbf24" color="#fbbf24" />
            {(item.rating?.average ?? 0).toFixed(1)}
            <span className={styles.cardReviews}>({item.rating?.count ?? 0})</span>
          </span>
        </div>

        {/* Botones */}
        <div className={styles.cardActions}>
          <button
            onClick={goDetail}
            className={styles.cardButton}
            title="Ver detalles del servicio"
          >
            <Eye size={16} />
            <span>Ver detalle</span>
          </button>

          {hasOrigin && hasDest ? (
            <a 
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.cardButton} ${styles.cardButtonPrimary}`}
              title="Abrir ruta en Google Maps"
            >
              <Navigation size={16} />
              <span>Cómo llegar</span>
            </a>
          ) : (
            <button
              disabled
              className={`${styles.cardButton} ${styles.cardButtonDisabled}`}
              title="Necesitas permitir ubicación para trazar la ruta"
            >
              <Navigation size={16} />
              <span>Cómo llegar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}