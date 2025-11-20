  // frontend/src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Layout/Navbar";
import { 
  MapPin, 
  Search, 
  Star, 
  Smartphone,
  UtensilsCrossed,
  Pill,
  Scissors,
  Hotel,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield
} from "lucide-react";
import styles from './page.module.css';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleExploreServices = () => {
    router.push("/negocios");
  };

  return (
    <div className={styles.landingPage}>
      <Navbar />
      
      <main className={styles.landingMain}>
        {/* ===== HERO SECTION ===== */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            {/* Texto Hero */}
            <div className={styles.heroText}>
              <div className={styles.badge}>
                <Sparkles size={16} />
                <span>Tu guía local de confianza</span>
              </div>

              <h1 className={styles.heroTitle}>
                Descubre los mejores
                <span className={styles.highlight}> servicios locales</span>
                <br />
                cerca de ti
              </h1>
              
              <p className={styles.heroSubtitle}>
                Encuentra restaurantes, farmacias, salones y mucho más en tu zona.
                <strong> ServiciosPE</strong> conecta tu ubicación con lo que necesitas, al instante.
              </p>

              {/* Botón principal CTA */}
              <button 
                onClick={handleExploreServices}
                className={styles.ctaButton}
              >
                <Search size={22} />
                <span>Ver servicios cerca de ti</span>
                <ArrowRight size={20} className={styles.ctaArrow} />
              </button>

              {/* Mini features */}
              <div className={styles.miniFeatures}>
                <div className={styles.miniFeature}>
                  <CheckCircle size={18} />
                  <span>100% Gratis</span>
                </div>
                <div className={styles.miniFeature}>
                  <MapPin size={18} />
                  <span>Geolocalización precisa</span>
                </div>
                <div className={styles.miniFeature}>
                  <Star size={18} />
                  <span>Reseñas verificadas</span>
                </div>
              </div>
            </div>

            {/* Imagen/GIF del mapa */}
            <div className={styles.heroImage}>
              <div className={styles.imageWrapper}>
                <img 
                  src="/mapa interactivo.gif" 
                  alt="Mapa interactivo de servicios" 
                  className={styles.mapGif}
                />
                <div className={styles.floatingCard1}>
                  <MapPin size={18} />
                  <div>
                    <strong>500m</strong>
                    <span>Radio de búsqueda</span>
                  </div>
                </div>
                <div className={styles.floatingCard2}>
                  <Star size={18} fill="#fbbf24" color="#fbbf24" />
                  <div>
                    <strong>4.8</strong>
                    <span>Calificación promedio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>¿Por qué elegir ServiciosPE?</h2>
            <p className={styles.sectionSubtitle}>
              La plataforma más completa para descubrir servicios locales en Perú
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <MapPin size={28} />
              </div>
              <h3>Búsqueda por ubicación</h3>
              <p>
                Encuentra servicios cercanos a ti usando geolocalización precisa.
                Filtra por distancia y categoría.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Star size={28} />
              </div>
              <h3>Reseñas confiables</h3>
              <p>
                Lee opiniones reales de otros usuarios y toma decisiones informadas
                sobre dónde ir.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Clock size={28} />
              </div>
              <h3>Horarios actualizados</h3>
              <p>
                Verifica si los negocios están abiertos ahora mismo y planifica
                tu visita con confianza.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Smartphone size={28} />
              </div>
              <h3>Fácil de usar</h3>
              <p>
                Interfaz intuitiva y rápida. Encuentra lo que buscas en segundos
                desde cualquier dispositivo.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Shield size={28} />
              </div>
              <h3>Información verificada</h3>
              <p>
                Datos de negocios actualizados y verificados. Google Places y
                nuestra base de datos local.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Search size={28} />
              </div>
              <h3>Filtros inteligentes</h3>
              <p>
                Busca por nombre, categoría, distancia y disponibilidad. Encuentra
                exactamente lo que necesitas.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CATEGORIES SECTION ===== */}
        <section className={styles.categoriesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Explora por categoría</h2>
            <p className={styles.sectionSubtitle}>
              Encuentra todo tipo de servicios en tu zona
            </p>
          </div>

          <div className={styles.categoriesGrid}>
            <div className={styles.categoryCard}>
              <div className={styles.categoryIconWrapper}>
                <UtensilsCrossed size={32} />
              </div>
              <h3>Restaurantes</h3>
              <p>Descubre los mejores lugares para comer cerca de ti</p>
            </div>

            <div className={styles.categoryCard}>
              <div className={styles.categoryIconWrapper}>
                <Pill size={32} />
              </div>
              <h3>Farmacias</h3>
              <p>Encuentra farmacias abiertas 24/7 en tu zona</p>
            </div>

            <div className={styles.categoryCard}>
              <div className={styles.categoryIconWrapper}>
                <Scissors size={32} />
              </div>
              <h3>Barberías y Salones</h3>
              <p>Encuentra el mejor estilo para ti</p>
            </div>

            <div className={styles.categoryCard}>
              <div className={styles.categoryIconWrapper}>
                <Hotel size={32} />
              </div>
              <h3>Hoteles</h3>
              <p>Encuentra alojamiento perfecto para tu estadía</p>
            </div>

            <div className={styles.categoryCard}>
              <div className={styles.categoryIconWrapper}>
                <ShoppingCart size={32} />
              </div>
              <h3>Supermercados</h3>
              <p>Localiza tiendas y minimarkets cercanos</p>
            </div>

            <div className={styles.categoryCard}>
              <div className={styles.categoryIconWrapper}>
                <Sparkles size={32} />
              </div>
              <h3>Más servicios</h3>
              <p>Gimnasios, veterinarias, talleres y mucho más</p>
            </div>
          </div>
        </section>

        {/* ===== CTA FINAL SECTION ===== */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              ¿Listo para descubrir servicios cerca de ti?
            </h2>
            <p className={styles.ctaSubtitle}>
              Únete a miles de usuarios que ya confían en ServiciosPE
            </p>
            <button 
              onClick={handleExploreServices}
              className={styles.ctaButtonLarge}
            >
              <Search size={24} />
              <span>Comenzar ahora</span>
              <ArrowRight size={22} className={styles.ctaArrow} />
            </button>
          </div>
        </section>
      </main>

      {/* Footer simple */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2024 ServiciosPE. Conectando comunidades locales en Perú.</p>
        </div>
      </footer>
    </div>
  );
}