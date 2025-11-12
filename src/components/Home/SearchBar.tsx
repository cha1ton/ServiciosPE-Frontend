// frontend/src/components/Home/SearchBar.tsx
"use client";

import React from "react";
import { Search, MapPin } from "lucide-react";
import styles from './home.module.css';

type Distance = 500 | 1000 | 2000 | 5000;

interface Props {
  value: string;
  onChange: (v: string) => void;
  distance: Distance;
  onDistanceChange: (d: Distance) => void;
  openNow: boolean;
  onToggleOpen: (v: boolean) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  distance,
  onDistanceChange,
  openNow,
  onToggleOpen,
  onSubmit,
  disabled,
}: Props) {
  return (
    <div className={styles.searchBar}>
      <div className={styles.searchInputWrapper}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="¿Qué buscas? (ej: restaurante, farmacia, lavandería)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.searchFilters}>
        <div className={styles.filterGroup}>
          <MapPin size={16} className={styles.filterIcon} />
          <select
            value={distance}
            onChange={(e) => onDistanceChange(Number(e.target.value) as Distance)}
            className={styles.distanceSelect}
          >
            <option value={500}>500 m</option>
            <option value={1000}>1 km</option>
            <option value={2000}>2 km</option>
            <option value={5000}>5 km</option>
          </select>
        </div>

        <label className={styles.checkboxLabel}>
          <input 
            type="checkbox" 
            checked={openNow} 
            onChange={(e) => onToggleOpen(e.target.checked)}
            className={styles.checkbox}
          />
          <span>Abierto ahora</span>
        </label>

        <button
          onClick={onSubmit}
          disabled={disabled}
          className={styles.searchButton}
          title={disabled ? "Primero permite ubicación" : "Buscar"}
        >
          <Search size={18} />
          <span>Buscar</span>
        </button>
      </div>
    </div>
  );
}