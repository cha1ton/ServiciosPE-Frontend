// frontend/src/components/Home/ResultCard.tsx

"use client";
import React from "react";
import { SearchItem } from "@/lib/search";
import { useRouter } from "next/navigation";

type LatLng = { lat: number; lng: number };

function buildDirectionsUrl(origin: LatLng, dest: LatLng, mode: "walking" | "driving" | "transit" = "walking") {
  const o = `${origin.lat},${origin.lng}`;
  const d = `${dest.lat},${dest.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=${mode}`;
}

export default function ResultCard({ item, origin }: { item: SearchItem; origin?: LatLng }) {

  const router = useRouter();
  const goDetail = () => {
    // para locales: source="serviciospe"; para Google: source="google"
    router.push(`/service/${item.source}/${item.id}`);
  };
  const hasOrigin = !!origin && typeof origin.lat === "number" && typeof origin.lng === "number";
  const hasDest = !!item.coordinates && typeof item.coordinates.lat === "number" && typeof item.coordinates.lng === "number";
  const directionsUrl = hasOrigin && hasDest
    ? buildDirectionsUrl(origin!, item.coordinates!)
    : "";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "96px 1fr",
        gap: 12,
        padding: 12,
        border: "1px solid #eee",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 8,
          background: "#f2f2f2",
          overflow: "hidden",
        }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "#999",
            }}
          >
            Sin foto
          </div>
        )}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>{item.name}</h3>
          <span
            style={{
              fontSize: 12,
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "2px 6px",
            }}
          >
            Fuente · {item.source === "google" ? "Google" : "ServiciosPE"}
          </span>
          {item.category ? (
            <span
              style={{
                fontSize: 12,
                color: "#444",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: "2px 6px",
                background: '#f7f7f8'
              }}
            >
              Categoría · {(item.category || '').replaceAll('_',' ')}
            </span>
          ) : null}
        </div>

        <div style={{ marginTop: 6, fontSize: 14, color: "#444" }}>
          {item.address?.formatted ||
            [item.address?.street, item.address?.district, item.address?.city]
              .filter(Boolean)
              .join(", ")}
        </div>

        <div style={{ marginTop: 6, fontSize: 14, color: "#666" }}>
          {Math.round(item.distanceMeters)} m • ⭐{" "}
          {item.rating?.average?.toFixed(1) ?? "0"} ({item.rating?.count ?? 0})
        </div>

        {/* Controles: botones separados, sin conflicto de clic */}
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={goDetail}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#f7f7f8",
              cursor: "pointer",
            }}
            title="Ver detalles del servicio"
          >
            👁️ Ver detalle
          </button>

          {hasOrigin && hasDest ? (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#f7f7f8",
                textDecoration: "none",
                color: "#111",
              }}
              title="Abrir ruta en Google Maps"
            >
              🗺️ Cómo llegar
            </a>
          ) : (
            <button
              disabled
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #eee",
                background: "#eee",
                color: "#888",
                cursor: "not-allowed",
              }}
              title="Necesitas permitir ubicación para trazar la ruta"
            >
              🗺️ Cómo llegar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
