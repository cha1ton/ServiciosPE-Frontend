// src/app/info/contacto/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, HelpCircle, ArrowLeft } from "lucide-react";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Contacto - ServiciosPE",
  description: "Escríbenos para soporte, sugerencias o alianzas.",
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconBadge}>
            <Mail size={32} strokeWidth={2} />
          </div>
          <h1 className={styles.title}>Contacto</h1>
          <p className={styles.headerSubtitle}>
            ¿Dudas, problemas o propuestas? Responderemos pronto
          </p>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.contactGrid}>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <Mail size={24} />
                </div>
                <h3 className={styles.contactTitle}>Email general</h3>
                <a 
                  href="mailto:contacto@serviciospe.pe" 
                  className={styles.contactEmail}
                >
                  contacto@serviciospe.pe
                </a>
                <p className={styles.contactDesc}>
                  Para consultas generales, sugerencias y alianzas
                </p>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <HelpCircle size={24} />
                </div>
                <h3 className={styles.contactTitle}>Soporte técnico</h3>
                <a 
                  href="mailto:soporte@serviciospe.pe" 
                  className={styles.contactEmail}
                >
                  soporte@serviciospe.pe
                </a>
                <p className={styles.contactDesc}>
                  Para problemas técnicos y ayuda con la plataforma
                </p>
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <a 
              href="mailto:contacto@serviciospe.pe" 
              className={styles.primaryBtn}
            >
              <Mail size={18} />
              Escribir a Contacto
            </a>
            <a 
              href="mailto:soporte@serviciospe.pe" 
              className={styles.secondaryBtn}
            >
              <HelpCircle size={18} />
              Escribir a Soporte
            </a>
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