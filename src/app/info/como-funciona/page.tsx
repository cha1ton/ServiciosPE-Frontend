// src/app/info/como-funciona/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo funciona - ServiciosPE",
  description: "Guía rápida para usar ServiciosPE y encontrar negocios cercanos.",
};

export default function HowItWorksPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Cómo funciona</h1>
      <ol>
        <li><b>Busca:</b> escribe lo que necesitas o elige una categoría (farmacias, lavanderías, etc.).</li>
        <li><b>Filtra:</b> ajusta radio (500 m a 5 km) y marca “abierto ahora” si aplica.</li>
        <li><b>Compara:</b> revisa distancia, calificación y horarios.</li>
        <li><b>Ir al lugar:</b> usa “Cómo llegar” para abrir la ruta en Maps.</li>
      </ol>
      <h2>Para proveedores</h2>
      <p>
        Registra tu negocio, sube fotos, horarios y responde reseñas. Tu ficha se actualiza al instante.
      </p>
      <p style={{ marginTop: 16 }}>
        ¿Dudas o propuestas?{" "}
        <Link href="/info/contacto" style={{ textDecoration: "underline" }}>
          Contáctanos
        </Link>.
      </p>
      <p style={{marginTop:8}}>
        <Link href="/">← Volver al inicio</Link>
      </p>
    </main>
  );
}
