// frontend/src/app/register-business/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Layout/Navbar";
import { BusinessService, BusinessFormData } from "@/lib/services";
import { useGeolocation } from "@/hooks/useGeolocation";
import MapPicker from "@/components/Map/MapPicker";
import { Building2, Info, MapPin, Phone, Clock, Image as ImageIcon } from "lucide-react";
import styles from './register.module.css';

const CATEGORIES = [
  { value: "restaurante", label: "Restaurante" },
  { value: "comida_bebidas", label: "Cafetería / Panadería / Pastelería" },
  { value: "centro_salud", label: "Centro de Salud" },
  { value: "farmacia", label: "Farmacia" },
  { value: "veterinaria", label: "Veterinaria / Pet Shop" },
  { value: "minimarket", label: "Minimarket" },
  { value: "supermercado", label: "Supermercado" },
  { value: "hotel", label: "Hotel / Hospedaje" },
  { value: "gimnasio", label: "Gimnasio" },
  { value: "escuela_baile", label: "Escuela de Baile" },
  { value: "taller_mecanico", label: "Taller Mecánico" },
  { value: "lavanderia", label: "Lavandería" },
  { value: "barberia", label: "Barbería" },
  { value: "salon_belleza", label: "Salón de Belleza" },
  { value: "discoteca", label: "Discoteca / Night Club" },
  { value: "otros", label: "Otros" },
];

export default function RegisterBusinessPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const { coordinates: geoCoords, getCurrentLocation, loading: geoLoading } = useGeolocation();

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!geoCoords) getCurrentLocation();
  }, []);

  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    description: "",
    category: "",
    offerings: "",
    phone: "",
    email: "",
    address: {},
    schedule: {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "18:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "09:00", close: "14:00" },
      sunday: { open: "", close: "" },
    },
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user?.email]);

  if (authLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Cargando...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > 3) {
      setError("Máximo 3 imágenes permitidas");
      return;
    }

    const oversized = files.find((file) => file.size > 2 * 1024 * 1024);
    if (oversized) {
      setError("Cada imagen debe ser menor a 2MB");
      return;
    }

    setImages((prev) => [...prev, ...files]);
    setError("");
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => {
        const parentKey = parent as keyof BusinessFormData;
        const parentValue = prev[parentKey];

        return {
          ...prev,
          [parentKey]: {
            ...(parentValue as Record<string, any>),
            [child]: value,
          },
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleScheduleChange = (
    day: string,
    field: "open" | "close",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.name || !formData.description || !formData.category) {
        throw new Error("Por favor completa todos los campos requeridos");
      }

      if (!coords) {
        throw new Error("Selecciona la ubicación en el mapa");
      }

      if (images.length === 0) {
        throw new Error("Debes subir al menos una imagen del negocio");
      }

      const submissionData = {
        ...formData,
        coordinates: coords,
      };

      console.log('📤 Enviando datos del negocio...');

      const result = await BusinessService.registerBusiness(
        submissionData,
        images
      );

      if (result.success) {
        console.log('✅ Negocio registrado exitosamente');
        await refreshUser();
        await new Promise(r => setTimeout(r, 100));
        router.push("/?message=business_registered");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('❌ Error registrando negocio:', error);
      const backendMessage = error?.response?.data?.message;
      setError(backendMessage || error.message || "Error al registrar el negocio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Registra tu Negocio</h1>
          <p className={styles.subtitle}>Completa la información de tu establecimiento</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Información Básica */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Building2 size={20} /></span>
              Información Básica
            </h2>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Nombre del Negocio</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Ej: Restaurante El Buen Sabor"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Categoría</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Descripción</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Describe tu negocio..."
              />
              <span className={styles.hint}>Cuéntale a tus clientes qué hace especial a tu negocio</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>¿Qué ofreces?</label>
              <textarea
                name="offerings"
                value={formData.offerings}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Ej: delivery, 24 horas, genéricos, promociones"
              />
              <span className={styles.hint}>Palabras clave que ayuden a los clientes a encontrarte</span>
            </div>
          </section>

          {/* Contacto */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Phone size={20} /></span>
              Información de Contacto
            </h2>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Teléfono</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="+51 999 999 999"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                disabled
              />
              <span className={styles.hint}>El email no puede ser modificado</span>
            </div>
          </section>

          {/* Ubicación */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><MapPin size={20} /></span>
              Ubicación
            </h2>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Selecciona tu ubicación en el mapa</label>
              <div className={styles.infoBox}>
                Arrastra el pin o toca el mapa para fijar la ubicación exacta del negocio.
              </div>
              <div className={styles.mapContainer}>
                <MapPicker
                  initialCenter={geoCoords || { lat: -12.0464, lng: -77.0428 }}
                  value={coords}
                  onChange={setCoords}
                  height="320px"
                />
              </div>
              <div className={`${styles.coordsInfo} ${!coords ? styles.warning : ''}`}>
                <MapPin size={16} />
                {coords
                  ? `Coordenadas: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
                  : 'Haz clic en el mapa para seleccionar tu ubicación'}
              </div>
            </div>

            <div className={styles.infoBox}>
              Los campos de dirección son opcionales e informativos. La ubicación real se toma del pin del mapa.
            </div>

            <div className={styles.addressGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Calle y número</label>
                <input
                  type="text"
                  name="address.street"
                  placeholder="Av. Principal 123"
                  value={formData.address?.street || ""}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Distrito</label>
                <input
                  type="text"
                  name="address.district"
                  placeholder="Miraflores"
                  value={formData.address?.district || ""}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Ciudad</label>
                <input
                  type="text"
                  name="address.city"
                  placeholder="Lima"
                  value={formData.address?.city || ""}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Referencia</label>
                <input
                  type="text"
                  name="address.reference"
                  placeholder="Cerca al parque central"
                  value={formData.address?.reference || ""}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>
          </section>

          {/* Imágenes */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><ImageIcon size={20} /></span>
              Imágenes del Negocio
            </h2>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Sube hasta 3 imágenes</label>
              <input
                type="file"
                multiple
                accept="image/*"
                required
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              <span className={styles.hint}>Máximo 3 imágenes de 2MB cada una</span>
            </div>

            {images.length > 0 && (
              <div className={styles.imagePreviewGrid}>
                {images.map((img, index) => (
                  <div key={index} className={styles.imagePreviewItem}>
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Preview ${index}`}
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeImageButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Horarios */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Clock size={20} /></span>
              Horario de Atención
            </h2>

            <div className={styles.scheduleGrid}>
              {Object.entries(formData.schedule).map(([day, schedule]) => (
                <div key={day} className={styles.scheduleRow}>
                  <span className={styles.dayLabel}>{day}</span>
                  <input
                    type="time"
                    value={schedule.open}
                    onChange={(e) => handleScheduleChange(day, "open", e.target.value)}
                    className={styles.timeInput}
                  />
                  <span className={styles.timeSeparator}>a</span>
                  <input
                    type="time"
                    value={schedule.close}
                    onChange={(e) => handleScheduleChange(day, "close", e.target.value)}
                    className={styles.timeInput}
                  />
                </div>
              ))}
            </div>
            <span className={styles.hint}>Deja los campos vacíos para días cerrados</span>
          </section>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? "Registrando Negocio..." : "Registrar Negocio"}
          </button>
        </form>
      </main>
    </div>
  );
}