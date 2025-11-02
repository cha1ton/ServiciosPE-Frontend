// frontend/src/app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad — ServiciosPE",
  description: "Política de Privacidad de ServiciosPE",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ margin: 0 }}>Política de Privacidad — ServiciosPE</h1>
      <p style={{ color: "#666", marginTop: 6 }}>Última actualización: 01/11/2025</p>

      <section style={{ marginTop: 18, lineHeight: 1.7 }}>
        <h2>Quiénes somos</h2>
        <p>
          ServiciosPE es una plataforma web para encontrar servicios cercanos en Perú.
          Esta política describe qué datos tratamos, con qué fines y tus opciones
          de control.
        </p>

        <h2>Datos que tratamos</h2>
        <ul>
          <li>
            <b>Cuenta de Google (OAuth 2.0):</b> nombre, correo y foto de perfil para
            autenticación.
          </li>
          <li>
            <b>Ubicación aproximada:</b> solo si otorgas permiso en el navegador; se usa
            para mejorar recomendaciones y calcular rutas.
          </li>
          <li>
            <b>Contenido generado por el usuario:</b> reseñas, calificaciones y favoritos.
          </li>
          <li>
            <b>Datos técnicos:</b> información estándar de logs (p. ej., IP aproximada,
            tipo de dispositivo/navegador) para seguridad y métricas.
          </li>
          <li>
            <b>Proveedores externos:</b> usamos servicios de terceros que pueden tratar
            datos según sus propias políticas:
            <ul>
              <li>Google Maps Platform (mapas, geocodificación, rutas).</li>
              <li>Google AdSense (publicidad; puede usar cookies propias y de terceros).</li>
            </ul>
          </li>
        </ul>

        <h2>Para qué usamos los datos</h2>
        <ul>
          <li>Autenticación y gestión de tu cuenta.</li>
          <li>Personalización de resultados cercanos a tu ubicación.</li>
          <li>Funcionamiento, mantenimiento y seguridad del servicio.</li>
          <li>Prevención de abuso y cumplimiento legal.</li>
          <li>Métricas de uso y mejora continua.</li>
        </ul>

        <h2>Base legal y consentimiento</h2>
        <p>
          Solicitamos tu consentimiento para el acceso a la ubicación y para el uso de
          tecnologías publicitarias cuando aplique. Puedes revocar permisos de ubicación
          desde los ajustes de tu navegador/dispositivo en cualquier momento.
        </p>

        <h2>Conservación</h2>
        <p>
          Conservamos tu cuenta y reseñas mientras la cuenta esté activa o por el tiempo
          necesario para cumplir obligaciones legales. Los registros técnicos se
          conservan por un periodo limitado.
        </p>

        <h2>Tus derechos</h2>
        <p>
          Puedes acceder y actualizar tu cuenta y datos (salvo obligaciones
          legales que lo impidan). Para solicitudes o dudas escríbenos a{" "}
          <a href="mailto:yoao.rodriguez@tecsup.edu.pe">yoao.rodriguez@tecsup.edu.pe</a> o{" "}
          <a href="mailto:chalton.mercado@tecsup.edu.pe">chalton.mercado@tecsup.edu.pe</a>
          {" "}(cámbialo por tu correo real).
        </p>

        <h2>Proveedores y enlaces</h2>
        <p>
          Algunos enlaces pueden dirigir a sitios de terceros con políticas propias.
          Revisa siempre sus términos y políticas antes de proporcionar datos.
        </p>

        <h2>Cambios a esta política</h2>
        <p>
          Podemos actualizar esta política para reflejar cambios del servicio o
          normativos. Indicaremos la fecha de “Última actualización” al inicio de la
          página.
        </p>

        <hr style={{ margin: "24px 0" }} />

        <p>
          ¿Tienes preguntas? Escríbenos a{" "}
          <a href="mailto:yoao.rodriguez@tecsup.edu.pe">yoao.rodriguez@tecsup.edu.pe</a> o{" "}
          <a href="mailto:chalton.mercado@tecsup.edu.pe">chalton.mercado@tecsup.edu.pe</a>
        </p>

        <p style={{ fontSize: 13, color: "#666" }}>
          Nota: Esta descripción es informativa y no constituye asesoría legal.
        </p>

        <p style={{ marginTop: 18 }}>
          <Link href="/" style={{ textDecoration: "underline" }}>
            ← Volver al inicio
          </Link>
        </p>
      </section>
    </main>
  );
}
