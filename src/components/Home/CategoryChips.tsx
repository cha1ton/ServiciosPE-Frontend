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
  | "minimarket"
  | "hotel"
  | "gimnasio"
  | "lavanderia"
  | "barberia"
  | "salon_belleza"
  | "taller_mecanico"
  | "discoteca"
  | "otros";

const CATEGORIES: { key: CategoryKey; label: string; icon: React.ReactNode }[] = [
  { key: "restaurante", label: "Restaurantes", icon: <UtensilsCrossed size={16} /> },
  { key: "comida_bebidas", label: "Cafeterías / Panaderías", icon: <Coffee size={16} /> },
  { key: "centro_salud", label: "Salud", icon: <Hospital size={16} /> },
  { key: "farmacia", label: "Farmacias", icon: <Pill size={16} /> },
  { key: "veterinaria", label: "Veterinarias", icon: <PawPrint size={16} /> },
  { key: "supermercado", label: "Supermercados", icon: <ShoppingCart size={16} /> },
  { key: "minimarket", label: "Minimarkets", icon: <Store size={16} /> },
  { key: "hotel", label: "Hoteles", icon: <Hotel size={16} /> },
  { key: "gimnasio", label: "Gimnasios", icon: <Dumbbell size={16} /> },
  { key: "lavanderia", label: "Lavanderías", icon: <Shirt size={16} /> },
  { key: "barberia", label: "Barberías", icon: <Scissors size={16} /> },
  { key: "salon_belleza", label: "Salones de Belleza", icon: <Sparkles size={16} /> },
  { key: "taller_mecanico", label: "Talleres Mecánicos", icon: <Wrench size={16} /> },
  { key: "discoteca", label: "Discotecas", icon: <Music size={16} /> },
  { key: "otros", label: "Otros", icon: <MapPin size={16} /> },
];

interface Props {
  selected: CategoryKey | "";
  onSelect: (k: CategoryKey) => void;
  style?: React.CSSProperties;
}

export default function CategoryChips({ selected, onSelect, style }: Props) {
  return (
    <div className={styles.categoryChips} style={style}>
      {CATEGORIES.map((c) => {
        const active = c.key === selected;
        return (
          <button
            key={c.key}
            onClick={() => onSelect(c.key)}
            className={`${styles.categoryChip} ${active ? styles.active : ''}`}
          >
            <span className={styles.categoryIcon}>{c.icon}</span>
            <span className={styles.categoryLabel}>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}