// frontend/src/components/Home/CategoryChips.tsx
"use client";

import React from "react";
import { 
  UtensilsCrossed, 
  Coffee, 
  Hospital, 
  Pill, 
  PawPrint, 
  ShoppingCart, 
  Store, 
  Hotel, 
  Dumbbell, 
  Shirt, 
  Scissors, 
  Sparkles, 
  Wrench, 
  Music, 
  MapPin 
} from "lucide-react";
import styles from './home.module.css';

export type CategoryKey =
  | "restaurante"
  | "comida_bebidas"
  | "centro_salud"
  | "farmacia"
  | "veterinaria"
  | "supermercado"
  | "hotel"
  | "gimnasio"
  | "lavanderia"
  | "barberia"
  | "salon_belleza"
  | "taller_mecanico"
  | "discoteca"
  | "otros";

const CATEGORIES: { 
  key: CategoryKey; 
  label: string; 
  icon: React.ReactNode;
  color: string;
}[] = [
  { key: "restaurante", label: "Restaurantes", icon: <UtensilsCrossed size={16} />, color: "#ef4444" }, // Rojo
  { key: "comida_bebidas", label: "Cafeterías / Panaderías", icon: <Coffee size={16} />, color: "#f97316" }, // Naranja
  { key: "centro_salud", label: "Salud", icon: <Hospital size={16} />, color: "#06b6d4" }, // Cyan
  { key: "farmacia", label: "Farmacias", icon: <Pill size={16} />, color: "#10b981" }, // Verde
  { key: "veterinaria", label: "Veterinarias", icon: <PawPrint size={16} />, color: "#8b5cf6" }, // Violeta
  { key: "supermercado", label: "Super/Minimarket", icon: <ShoppingCart size={16} />, color: "#eab308" }, // Amarillo
  { key: "hotel", label: "Hoteles", icon: <Hotel size={16} />, color: "#3b82f6" }, // Azul
  { key: "gimnasio", label: "Gimnasios", icon: <Dumbbell size={16} />, color: "#f43f5e" }, // Rosa
  { key: "lavanderia", label: "Lavanderías", icon: <Shirt size={16} />, color: "#14b8a6" }, // Teal
  { key: "barberia", label: "Barberías", icon: <Scissors size={16} />, color: "#64748b" }, // Slate
  { key: "salon_belleza", label: "Salones de Belleza", icon: <Sparkles size={16} />, color: "#ec4899" }, // Pink
  { key: "taller_mecanico", label: "Talleres Mecánicos", icon: <Wrench size={16} />, color: "#6366f1" }, // Indigo
  { key: "discoteca", label: "Discotecas", icon: <Music size={16} />, color: "#a855f7" }, // Púrpura
  { key: "otros", label: "Otros", icon: <MapPin size={16} />, color: "#71717a" }, // Gris
];

interface Props {
  selected: CategoryKey | "";
  onSelect: (k: CategoryKey) => void;
  counts?: Record<CategoryKey, number>;
  style?: React.CSSProperties;
}

export default function CategoryChips({ selected, onSelect, counts, style }: Props) {
  return (
    <div className={styles.categoryChips} style={style}>
      {CATEGORIES.map((c) => {
        const active = c.key === selected;
        const count = counts?.[c.key] ?? 0;
        
        return (
          <button
            key={c.key}
            onClick={() => onSelect(c.key)}
            className={`${styles.categoryChip} ${active ? styles.active : ''}`}
            style={{
              '--category-color': c.color,
            } as React.CSSProperties}
          >
            <span className={styles.categoryIcon}>{c.icon}</span>
            <span className={styles.categoryLabel}>{c.label}</span>
            {count > 0 && (
              <span className={styles.categoryCount}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}