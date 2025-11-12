// src/app/info/como-funciona/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, Search, Filter, Star, MapPin, Store, ArrowLeft } from "lucide-react";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Cómo funciona - ServiciosPE",
  description: "Guía rápida para usar ServiciosPE y encontrar negocios cercanos.",
};

export default function HowItWorksPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconBadge}>
            <Lightbulb size={32} strokeWidth={2} />
          </div>
          <h1 className={styles.title}>Cómo funciona</h1>
          <p className={styles.headerSubtitle}>
            Guía rápida para usar ServiciosPE y encontrar negocios cercanos
          </p>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Para usuarios</h2>
            
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepIcon}>
                  <Search size={24} />
                </div>
                <h3 className={styles.stepTitle}>Busca</h3>
                <p className={styles.stepText}>
                  Escribe lo que necesitas o elige una categoría (farmacias, lavanderías, etc.)
                </p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepIcon}>
                  <Filter size={24} />
                </div>
                <h3 className={styles.stepTitle}>Filtra</h3>
                <p className={styles.stepText}>
                  Ajusta radio (500 m a 5 km) y marca "abierto ahora" si aplica
                </p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepIcon}>
                  <Star size={24} />
                </div>
                <h3 className={styles.stepTitle}>Compara</h3>
                <p className={styles.stepText}>
                  Revisa distancia, calificación y horarios de cada negocio
                </p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepIcon}>
                  <MapPin size={24} />
                </div>
                <h3 className={styles.stepTitle}>Ir al lugar</h3>
                <p className={styles.stepText}>
                  Usa "Cómo llegar" para abrir la ruta en Google Maps
                </p>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Store className={styles.sectionIcon} size={24} />
              <h2 className={styles.sectionTitle}>Para proveedores</h2>
            </div>
            <p className={styles.text}>
              Registra tu negocio, sube fotos, horarios y responde reseñas. Tu ficha se actualiza al instante
              y aparece automáticamente en las búsquedas cercanas.
            </p>
          </div>

          <div className={styles.ctaBox}>
            <p className={styles.ctaText}>
              ¿Dudas o propuestas?{" "}
              <Link href="/info/contacto" className={styles.link}>
                Contáctanos →
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