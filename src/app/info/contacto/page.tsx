// src/app/info/contacto/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = {
  title: "Contacto - ServiciosPE",
  description: "Escríbenos para soporte, sugerencias o alianzas.",
};

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Contacto</h1>
      <p>¿Dudas, problemas o propuestas? Responderemos pronto.</p>
      <ul>
        <li>Email general: <a href="mailto:contacto@serviciospe.pe">contacto@serviciospe.pe</a></li>
        <li>Soporte: <a href="mailto:soporte@serviciospe.pe">soporte@serviciospe.pe</a></li>
      </ul>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <a href="mailto:contacto@serviciospe.pe" style={{ padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8 }}>
          Escribir a Contacto
        </a>
        <a href="mailto:soporte@serviciospe.pe" style={{ padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8 }}>
          Escribir a Soporte
        </a>
      </div>
      <p style={{marginTop:8}}>
        <Link href="/">← Volver al inicio</Link>
      </p>
    </main>
  );
}
