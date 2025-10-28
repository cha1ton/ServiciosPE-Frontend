// frontend/src/components/Home/CategoryChips.tsx
"use client";

import React from "react";

export type CategoryKey =
  | "restaurante"
  | "comida_bebidas"
  | "centro_salud"
  | "farmacia"
  | "veterinaria"
  | "supermercado"
  | "minimarket"
  | "hotel"
  | "gimnasio"
  | "lavanderia"
  | "barberia"
  | "salon_belleza"
  | "taller_mecanico"
  | "discoteca"
  | "otros";

const CATEGORIES: { key: CategoryKey; label: string; emoji: string }[] = [
  { key: "restaurante", label: "Restaurantes", emoji: "🍽️" },
  { key: "comida_bebidas", label: "Cafeterías / Panaderías", emoji: "☕" },
  { key: "centro_salud", label: "Salud", emoji: "🏥" },
  { key: "farmacia", label: "Farmacias", emoji: "💊" },
  { key: "veterinaria", label: "Veterinarias", emoji: "🐾" },
  { key: "supermercado", label: "Supermercados", emoji: "🛒" },
  { key: "minimarket", label: "Minimarkets", emoji: "🛍️" },
  { key: "hotel", label: "Hoteles", emoji: "🏨" },
  { key: "gimnasio", label: "Gimnasios", emoji: "💪" },
  { key: "lavanderia", label: "Lavanderías", emoji: "🧺" },
  { key: "barberia", label: "Barberías", emoji: "💈" },
  { key: "salon_belleza", label: "Salones de Belleza", emoji: "💅" },
  { key: "taller_mecanico", label: "Talleres Mecánicos", emoji: "🧰" },
  { key: "discoteca", label: "Discotecas", emoji: "🎶" },
  { key: "otros", label: "Otros", emoji: "📍" },
];


interface Props {
  selected: CategoryKey | "" ;
  onSelect: (k: CategoryKey) => void;
  style?: React.CSSProperties;
}

export default function CategoryChips({ selected, onSelect, style }: Props) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", ...style }}>
      {CATEGORIES.map((c) => {
        const active = c.key === selected;
        return (
          <button
            key={c.key}
            onClick={() => onSelect(c.key)}
            style={{
              padding: "8px 10px",
              borderRadius: 20,
              border: active ? "1px solid #333" : "1px solid #ddd",
              background: active ? "#e9e9ee" : "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <span style={{ marginRight: 6 }}>{c.emoji}</span>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
