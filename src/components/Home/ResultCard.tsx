// frontend/src/components/Home/ResultCard.tsx

"use client";
import React from "react";
import { SearchItem } from "@/lib/search";

export default function ResultCard({ item }: { item: SearchItem }) {
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
          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#999" }}>Sin foto</div>
        )}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3 style={{ margin: 0 }}>{item.name}</h3>
          <span style={{ fontSize: 12, color: "#666", border: "1px solid #ddd", borderRadius: 8, padding: "2px 6px" }}>
            {item.category}
          </span>
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: "#444" }}>
          {item.address?.formatted || [item.address?.street, item.address?.district, item.address?.city].filter(Boolean).join(", ")}
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: "#666" }}>
          {Math.round(item.distanceMeters)} m • ⭐ {item.rating?.average?.toFixed(1) ?? "0"} ({item.rating?.count ?? 0})
        </div>
        {item.contact?.phone && <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>📞 {item.contact.phone}</div>}
      </div>
    </div>
  );
}
