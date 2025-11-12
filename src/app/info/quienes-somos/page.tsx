// src/app/info/quienes-somos/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Users, Target, CheckCircle, ArrowLeft } from "lucide-react";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Quiénes somos - ServiciosPE",
  description: "Conoce la misión y el equipo detrás de ServiciosPE.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconBadge}>
            <Users size={32} strokeWidth={2} />
          </div>
          <h1 className={styles.title}>Quiénes somos</h1>
          <p className={styles.headerSubtitle}>
            Conoce la misión y el equipo detrás de ServiciosPE
          </p>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.section}>
            <p className={styles.lead}>
              ServiciosPE es una plataforma peruana que conecta a las personas con servicios locales
              cercanos, confiables y relevantes. Combinamos geolocalización, filtros útiles y un
              asistente con IA para encontrar rápidamente lo que necesitas.
            </p>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Target className={styles.sectionIcon} size={24} />
              <h2 className={styles.sectionTitle}>Nuestra misión</h2>
            </div>
            <p className={styles.text}>
              Reducir el tiempo perdido buscando servicios y aumentar la visibilidad digital de
              pequeños y medianos negocios en Perú.
            </p>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <CheckCircle className={styles.sectionIcon} size={24} />
              <h2 className={styles.sectionTitle}>Lo que hacemos</h2>
            </div>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                Mapeamos servicios por distancia, categoría y "abierto ahora"
              </li>
              <li className={styles.listItem}>
                Mostramos fichas claras con datos de contacto, horarios y reseñas
              </li>
              <li className={styles.listItem}>
                Permitimos que los dueños gestionen su información sin intermediarios
              </li>
            </ul>
          </div>

          <div className={styles.ctaBox}>
            <p className={styles.ctaText}>
              ¿Quieres saber más sobre el funcionamiento?{" "}
              <Link href="/info/como-funciona" className={styles.link}>
                Lee cómo funciona →
              </Link>
            </p>
          </div>

          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}