// frontend/src/app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Mail } from "lucide-react";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Política de Privacidad — ServiciosPE",
  description: "Política de Privacidad de ServiciosPE",
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconBadge}>
            <Shield size={32} strokeWidth={2} />
          </div>
          <h1 className={styles.title}>Política de Privacidad</h1>
          <p className={styles.subtitle}>ServiciosPE</p>
          <p className={styles.date}>Última actualización: 01/11/2025</p>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Quiénes somos</h2>
            <p className={styles.text}>
              ServiciosPE es una plataforma web para encontrar servicios cercanos en Perú.
              Esta política describe qué datos tratamos, con qué fines y tus opciones
              de control.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Datos que tratamos</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Cuenta de Google (OAuth 2.0):</strong> nombre, correo y foto de perfil para
                autenticación.
              </li>
              <li className={styles.listItem}>
                <strong>Ubicación aproximada:</strong> solo si otorgas permiso en el navegador; se usa
                para mejorar recomendaciones y calcular rutas.
              </li>
              <li className={styles.listItem}>
                <strong>Contenido generado por el usuario:</strong> reseñas, calificaciones y favoritos.
              </li>
              <li className={styles.listItem}>
                <strong>Datos técnicos:</strong> información estándar de logs (p. ej., IP aproximada,
                tipo de dispositivo/navegador) para seguridad y métricas.
              </li>
              <li className={styles.listItem}>
                <strong>Proveedores externos:</strong> usamos servicios de terceros que pueden tratar
                datos según sus propias políticas:
                <ul className={styles.nestedList}>
                  <li>Google Maps Platform (mapas, geocodificación, rutas)</li>
                  <li>Google AdSense (publicidad; puede usar cookies propias y de terceros)</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Para qué usamos los datos</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>Autenticación y gestión de tu cuenta</li>
              <li className={styles.listItem}>Personalización de resultados cercanos a tu ubicación</li>
              <li className={styles.listItem}>Funcionamiento, mantenimiento y seguridad del servicio</li>
              <li className={styles.listItem}>Prevención de abuso y cumplimiento legal</li>
              <li className={styles.listItem}>Métricas de uso y mejora continua</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Base legal y consentimiento</h2>
            <p className={styles.text}>
              Solicitamos tu consentimiento para el acceso a la ubicación y para el uso de
              tecnologías publicitarias cuando aplique. Puedes revocar permisos de ubicación
              desde los ajustes de tu navegador/dispositivo en cualquier momento.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Conservación</h2>
            <p className={styles.text}>
              Conservamos tu cuenta y reseñas mientras la cuenta esté activa o por el tiempo
              necesario para cumplir obligaciones legales. Los registros técnicos se
              conservan por un periodo limitado.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tus derechos</h2>
            <p className={styles.text}>
              Puedes acceder y actualizar tu cuenta y datos (salvo obligaciones
              legales que lo impidan). Para solicitudes o dudas escríbenos a{" "}
              <a href="mailto:yoao.rodriguez@tecsup.edu.pe" className={styles.email}>
                yoao.rodriguez@tecsup.edu.pe
              </a>{" "}
              o{" "}
              <a href="mailto:chalton.mercado@tecsup.edu.pe" className={styles.email}>
                chalton.mercado@tecsup.edu.pe
              </a>.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Proveedores y enlaces</h2>
            <p className={styles.text}>
              Algunos enlaces pueden dirigir a sitios de terceros con políticas propias.
              Revisa siempre sus términos y políticas antes de proporcionar datos.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cambios a esta política</h2>
            <p className={styles.text}>
              Podemos actualizar esta política para reflejar cambios del servicio o
              normativos. Indicaremos la fecha de "Última actualización" al inicio de la
              página.
            </p>
          </section>

          <div className={styles.divider}></div>

          <div className={styles.contactBox}>
            <Mail className={styles.contactIcon} size={24} />
            <div>
              <p className={styles.contactTitle}>¿Tienes preguntas?</p>
              <p className={styles.contactText}>
                Escríbenos a{" "}
                <a href="mailto:yoao.rodriguez@tecsup.edu.pe" className={styles.email}>
                  yoao.rodriguez@tecsup.edu.pe
                </a>{" "}
                o{" "}
                <a href="mailto:chalton.mercado@tecsup.edu.pe" className={styles.email}>
                  chalton.mercado@tecsup.edu.pe
                </a>
              </p>
            </div>
          </div>

          <p className={styles.disclaimer}>
            Nota: Esta descripción es informativa y no constituye asesoría legal.
          </p>

          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}