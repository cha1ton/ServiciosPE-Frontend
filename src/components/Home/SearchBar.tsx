// frontend/src/components/Home/SearchBar.tsx
"use client";

import React from "react";

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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 8,
        padding: 12,
        border: "1px solid #eee",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      <input
        type="text"
        placeholder="¿Qué buscas? (ej: restaurante, farmacia, lavandería)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          outline: "none",
        }}
      />

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={distance}
          onChange={(e) => onDistanceChange(Number(e.target.value) as Distance)}
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
        >
          <option value={500}>500 m</option>
          <option value={1000}>1 km</option>
          <option value={2000}>2 km</option>
          <option value={5000}>5 km</option>
        </select>

        <label style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 14 }}>
          <input type="checkbox" checked={openNow} onChange={(e) => onToggleOpen(e.target.checked)} />
          Abierto ahora
        </label>

        <div style={{ flex: 1 }} />

        <button
          onClick={onSubmit}
          disabled={disabled}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: disabled ? "#eee" : "#f7f7f8",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          title={disabled ? "Primero permite ubicación" : "Buscar"}
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
