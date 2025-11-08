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
        display: "block",
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 12,
        background: "#fff",
        textDecoration: "none",
        color: "#111",
      }}
      aria-label="Publicidad"
    >
      <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Publicidad</div>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: "#444" }}>{text}</div>
    </a>
  );
}
