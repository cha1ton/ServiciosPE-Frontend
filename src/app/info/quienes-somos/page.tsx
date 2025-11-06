// src/app/info/quienes-somos/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = {
  title: "Quiénes somos - ServiciosPE",
  description: "Conoce la misión y el equipo detrás de ServiciosPE.",
};

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Quiénes somos</h1>
      <p>
        ServiciosPE es una plataforma peruana que conecta a las personas con servicios locales
        cercanos, confiables y relevantes. Combinamos geolocalización, filtros útiles y un
        asistente con IA para encontrar rápidamente lo que necesitas.
      </p>
      <h2>Nuestra misión</h2>
      <p>
        Reducir el tiempo perdido buscando servicios y aumentar la visibilidad digital de
        pequeños y medianos negocios en Perú.
      </p>
      <h2>Lo que hacemos</h2>
      <ul>
        <li>Mapeamos servicios por distancia, categoría y “abierto ahora”.</li>
        <li>Mostramos fichas claras con datos de contacto, horarios y reseñas.</li>
        <li>Permitimos que los dueños gestionen su información sin intermediarios.</li>
      </ul>
      <p style={{ marginTop: 16 }}>
        ¿Quieres saber más sobre el funcionamiento?{" "}
        <Link href="/info/como-funciona" style={{ textDecoration: "underline" }}>
          Lee cómo funciona
        </Link>.
      </p>
      <p style={{marginTop:8}}>
        <Link href="/">← Volver al inicio</Link>
      </p>
    </main>
  );
}
