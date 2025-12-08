// frontend/src/components/Ads/DirectLinkCard.tsx
"use client";

export default function DirectLinkCard({
  href,
  title = "Publicidad",
  text = "Contenido patrocinado",
}: {
  href: string;
  title?: string;
  text?: string;
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 8,                 // ⬅️ antes 12
        background: "#f9fafb",
        textDecoration: "none",
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
      }}
      aria-label="Publicidad"
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#9ca3af",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Publicidad</span>
        <span
          style={{
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: 999,
            background: " #4285f4",
            color: "#e2e6e6ff",
          }}
        >
          Anuncio
        </span>
      </div>

      <div
        style={{
          fontWeight: 600,
          fontSize: 13,          // ⬅️ más pequeño
          color: "#111827",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#4b5563",
          lineHeight: 1.3,
        }}
      >
        {text}
      </div>
    </a>
  );
}

