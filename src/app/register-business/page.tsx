// frontend/src/app/register-business/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Layout/Navbar";
import { BusinessService, BusinessFormData } from "@/lib/services";
import { useGeolocation } from "@/hooks/useGeolocation";
import MapPicker from "@/components/Map/MapPicker";

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

  // NUEVO: estado para el pin
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

   // Centrar mapa en geolocalización cuando llegue
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
    // ✅ CORRECCIÓN: Usar los valores directamente, no la constante
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

  // ✅ CORRECCIÓN: Manejar autenticación en useEffect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // ✅ CORRECCIÓN: Actualizar email cuando el usuario esté disponible
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user?.email]);

  // Mostrar loading mientras verifica autenticación
  if (authLoading) {
    return (
      <div>
        <p>Cargando...</p>
      </div>
    );
  }

  // No renderizar nada si no está autenticado (será redirigido)
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const handleGetLocation = () => {
    getCurrentLocation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.name || !formData.description || !formData.category) {
        throw new Error("Por favor completa todos los campos requeridos");
      }

      // ⚠️ coords obligatorias (pin en el mapa)
      if (!coords) {
        throw new Error("Selecciona la ubicación en el mapa");
      }

      if (images.length === 0) {
        throw new Error("Debes subir al menos una imagen del negocio");
      }

      // Agregar coordenadas si están disponibles
      const submissionData = {
        ...formData,
        // fuente de verdad:
        coordinates: coords,
        // los campos de address (street/district/city/reference) quedan opcionales
      };

      console.log('📤 Enviando datos del negocio (coords como verdad)...');

      const result = await BusinessService.registerBusiness(
        submissionData,
        images
      );

      if (result.success) {
        console.log('✅ Negocio registrado exitosamente');
        console.log('🔄 Refrescando datos del usuario...');

        await refreshUser();
        await new Promise(r => setTimeout(r, 100));

        console.log('✅ Negocio registrado - usuario debería ser proveedor ahora');

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
    <div>
      <Navbar />

      <main>
        <div>
          <h1>Registra tu Negocio</h1>
          <p>Completa la información de tu establecimiento</p>

          {error && (<div>{error}</div>)}

          <form onSubmit={handleSubmit}>
            {/* Información básica */}
            <div>
              <div>
                <label>Nombre del Negocio *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
            <label>Categoría *</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Selecciona una categoría</option>
              {[
                ...CATEGORIES,
              ].map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

              <div>
                <label>Descripción *</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              {/* Que ofreces */}
              <div>
                <label>Que ofreces? (palabras clave)</label>
                <textarea
                  name="offerings"
                  rows={2}
                  placeholder="Ej: delivery, 24 horas, genericos, promociones, salsa/bachata principiante"
                  value={formData.offerings}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Contacto */}
            <div>
              <div>
                <label>Teléfono *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                />
                <p>El email no se puede modificar</p>
              </div>
            </div>


            {/* Agregando codigo - 11/10/25 */}
            {/* Dirección opcional (solo informativa) */}
            <div style={{ marginTop: 16 }}>
              <label>Información de dirección (opcional)</label>
              <p style={{ margin: '6px 0 12px', fontSize: 13 }}>
                Estos campos son solo informativos. La ubicación real se toma del pin del mapa.
              </p>

              <div>
                <input type="text" name="address.street" placeholder="Calle y número (opcional)"
                  value={formData.address?.street || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <input type="text" name="address.district" placeholder="Distrito (opcional)"
                  value={formData.address?.district || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input type="text" name="address.city" placeholder="Ciudad (opcional)"
                  value={formData.address?.city || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <input type="text" name="address.reference" placeholder="Referencia (opcional)"
                  value={formData.address?.reference || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>


            {/* UBICACIÓN: Mapa con pin obligatorio */}
            <div style={{ marginTop: 16 }}>
              <label>Ubicación en el mapa *</label>
              <p style={{ margin: '6px 0 12px', fontSize: 14 }}>
                Arrastra el pin o toca el mapa para fijar la ubicación exacta del negocio.
              </p>

              <MapPicker
                initialCenter={geoCoords || { lat: -12.0464, lng: -77.0428 }}
                value={coords}
                onChange={setCoords}
                height="320px"
              />

              <div style={{ marginTop: 8, fontSize: 13 }}>
                {coords ? (
                  <>Coordenadas seleccionadas: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</>
                ) : (
                  <span style={{ color: '#d00' }}>Selecciona la ubicación en el mapa</span>
                )}
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <label>Imágenes del Negocio (3 Imágenes, 2MB cada una) *</label>
              <input
                type="file"
                multiple
                accept="image/*"
                required
                onChange={handleImageChange}
              />

              {images.length > 0 && (
                <div>
                  {images.map((img, index) => (
                    <div key={index}>
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${index}`}
                      />
                      <button type="button" onClick={() => removeImage(index)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Horarios */}
            <div>
              <label>Horario de Atención</label>
              <div>
                {Object.entries(formData.schedule).map(([day, schedule]) => (
                  <div key={day}>
                    <span>{day}:</span>
                    <input
                      type="time"
                      value={schedule.open}
                      onChange={(e) =>
                        handleScheduleChange(day, "open", e.target.value)
                      }
                    />
                    <span>a</span>
                    <input
                      type="time"
                      value={schedule.close}
                      onChange={(e) =>
                        handleScheduleChange(day, "close", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Registrando Negocio..." : "Registrar Negocio"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

